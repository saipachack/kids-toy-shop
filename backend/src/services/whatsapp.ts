import pino from 'pino';
import QRCode from 'qrcode';
import prisma from '../prisma';

let baileysModule: any = null;
async function loadBaileys() {
  if (!baileysModule) {
    baileysModule = await import('@whiskeysockets/baileys');
  }
  return baileysModule;
}

// Custom database auth state provider for WhiskeySockets/Baileys
async function useDbAuthState(sessionId: string): Promise<{ state: any; saveCreds: () => Promise<void> }> {
  const baileys = await loadBaileys();
  const initAuthCreds = baileys.initAuthCreds;
  const BufferJSON = baileys.BufferJSON;
  const proto = baileys.proto;

  const writeData = async (data: any, key: string) => {
    const value = JSON.stringify(data, BufferJSON.replacer);
    await prisma.whatsappSession.upsert({
      where: { key },
      create: { key, value },
      update: { value }
    });
  };

  const readData = async (key: string) => {
    const record = await prisma.whatsappSession.findUnique({
      where: { key }
    });
    return record ? JSON.parse(record.value, BufferJSON.reviver) : null;
  };

  const removeData = async (key: string) => {
    try {
      await prisma.whatsappSession.delete({
        where: { key }
      });
    } catch (e) {
      // Ignore if record doesn't exist
    }
  };

  // 1. Load or initialize credentials
  const credsRecord = await readData(`${sessionId}:creds`);
  let creds: any = credsRecord || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [id: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${sessionId}:${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${sessionId}:${category}-${id}`;
              if (value) {
                tasks.push(writeData(value, key));
              } else {
                tasks.push(removeData(key));
              }
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: async () => {
      await writeData(creds, `${sessionId}:creds`);
    }
  };
}

type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

class WhatsappService {
  private sock: any = null;
  private status: ConnectionStatus = 'DISCONNECTED';
  private qr: string | null = null;
  private connectedNumber: string | null = null;
  private connectedName: string | null = null;
  private sessionId = 'admin-store-session';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  getStatus() {
    return {
      status: this.status,
      qr: this.qr,
      connectedNumber: this.connectedNumber,
      connectedName: this.connectedName
    };
  }

  async init() {
    // Check if session creds exist in DB to auto-connect
    const hasSession = await prisma.whatsappSession.findUnique({
      where: { key: `${this.sessionId}:creds` }
    });

    if (hasSession) {
      console.log('[WhatsApp] Existing session found. Autoconnecting...');
      this.connect();
    } else {
      console.log('[WhatsApp] No existing session. Waiting for admin manual pairing.');
    }
  }

  async connect() {
    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
      console.log('[WhatsApp] Already connected or connecting. Skipping connection request.');
      return;
    }

    this.status = 'CONNECTING';
    this.qr = null;

    try {
      const baileys = await loadBaileys();
      const makeWASocket = baileys.default || baileys;
      const DisconnectReason = baileys.DisconnectReason;

      const { state, saveCreds } = await useDbAuthState(this.sessionId);

      this.sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            this.qr = await QRCode.toDataURL(qr);
            this.status = 'DISCONNECTED'; // Still disconnected until scanned
          } catch (err) {
            console.error('[WhatsApp] Error generating QR Data URL:', err);
          }
        }

        if (connection === 'connecting') {
          this.status = 'CONNECTING';
        }

        if (connection === 'open') {
          this.status = 'CONNECTED';
          this.qr = null;
          this.reconnectAttempts = 0;

          const userJid = this.sock?.user?.id;
          if (userJid) {
            this.connectedNumber = userJid.split(':')[0] || userJid.split('@')[0];
            this.connectedName = this.sock?.user?.name || 'Linked WhatsApp Device';
            console.log(`[WhatsApp] Connected successfully to account: ${this.connectedName} (${this.connectedNumber})`);
          }
        }

        if (connection === 'close') {
          this.qr = null;
          this.connectedNumber = null;
          this.connectedName = null;

          const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log(`[WhatsApp] Connection closed. Reason: ${lastDisconnect?.error}. Reconnect: ${shouldReconnect}`);

          if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.status = 'CONNECTING';
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            console.log(`[WhatsApp] Reconnecting in ${delay / 1000}s (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), delay);
          } else {
            this.status = 'DISCONNECTED';
            this.sock = null;
            if (!shouldReconnect) {
              console.log('[WhatsApp] Logged out from WhatsApp on phone. Session cleared.');
              await this.clearSession();
            }
          }
        }
      });
    } catch (err) {
      console.error('[WhatsApp] Failed to start connection:', err);
      this.status = 'DISCONNECTED';
      this.sock = null;
    }
  }

  async disconnect() {
    this.status = 'DISCONNECTED';
    this.qr = null;
    this.connectedNumber = null;
    this.connectedName = null;

    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (err) {
        // Ignore socket already closed errors
      }
      this.sock = null;
    }

    await this.clearSession();
    console.log('[WhatsApp] Account manually unlinked.');
  }

  private async clearSession() {
    try {
      await prisma.whatsappSession.deleteMany({
        where: {
          key: {
            startsWith: `${this.sessionId}:`
          }
        }
      });
    } catch (err) {
      console.error('[WhatsApp] Error deleting database session keys:', err);
    }
  }

  private formatJid(phone: string): string {
    // Remove leading '+', spaces, and hyphens
    let clean = phone.replace(/[+\s-]/g, '');
    
    // Convert 020... to 85620... for Laotian numbers
    if (clean.startsWith('020')) {
      clean = '85620' + clean.slice(3);
    } else if (clean.startsWith('20') && clean.length === 10) {
      // If the number was parsed without a leading zero
      clean = '856' + clean;
    }
    
    return `${clean}@s.whatsapp.net`;
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    if (this.status !== 'CONNECTED' || !this.sock) {
      console.log(`[WhatsApp] Simulated OTP for ${phone}: ${code} (WhatsApp Bot is Disconnected)`);
      return false;
    }

    try {
      const jid = this.formatJid(phone);
      const text = `🔑 *[Kids Shop]* ລະຫັດຢືນຢັນ OTP ຂອງທ່ານແມ່ນ: *${code}*\n(ໃຊ້ສຳລັບສະໝັກສະມາຊິກ, ມີອາຍຸການໃຊ້ງານ 5 ນາທີ).\n\n🔑 Your verification code is: *${code}* (valid for 5 minutes).`;
      
      await this.sock.sendMessage(jid, { text });
      console.log(`[WhatsApp] Sent real OTP code successfully to: ${jid}`);
      return true;
    } catch (err) {
      console.error(`[WhatsApp] Error sending OTP to ${phone}:`, err);
      return false;
    }
  }
}

export const whatsapp = new WhatsappService();

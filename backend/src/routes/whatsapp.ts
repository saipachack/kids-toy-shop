import { Router, Response } from 'express';
import { authenticateToken, adminOnly } from '../middlewares/auth';
import { whatsapp } from '../services/whatsapp';

const router = Router();

// Get WhatsApp connection status and current QR code
router.get('/status', authenticateToken, adminOnly, async (req, res: Response) => {
  try {
    const status = whatsapp.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      messageEn: error.message || 'Failed to get WhatsApp status',
      messageTh: 'ล้มเหลวในการดึงสถานะ WhatsApp',
      messageLa: 'ບໍ່ສາມາດດຶງຂໍ້ມູນສະຖານະ WhatsApp'
    });
  }
});

// Trigger connection initialization / QR regeneration
router.post('/connect', authenticateToken, adminOnly, async (req, res: Response) => {
  try {
    // This starts connection asynchronously in background, updates status
    whatsapp.connect();
    res.json({
      messageEn: 'Connection initialization triggered',
      messageTh: 'เริ่มกระบวนการเชื่อมต่อแล้ว',
      messageLa: 'ເລີ່ມຕົ້ນຂັ້ນຕອນການເຊື່ອມຕໍ່ແລ້ວ'
    });
  } catch (error: any) {
    res.status(500).json({
      messageEn: error.message || 'Failed to trigger connection',
      messageTh: 'ล้มเหลวในการเริ่มการเชื่อมต่อ',
      messageLa: 'ບໍ່ສາມາດເລີ່ມຕົ້ນການເຊື່ອມຕໍ່'
    });
  }
});

// Manually disconnect / logout from WhatsApp
router.post('/disconnect', authenticateToken, adminOnly, async (req, res: Response) => {
  try {
    await whatsapp.disconnect();
    res.json({
      messageEn: 'WhatsApp disconnected and session cleared',
      messageTh: 'ยกเลิกการเชื่อมต่อ WhatsApp และล้างเซสชันแล้ว',
      messageLa: 'ຍົກເລີກການເຊື່ອມຕໍ່ WhatsApp ແລະລ້າງເຊສຊັນແລ້ວ'
    });
  } catch (error: any) {
    res.status(500).json({
      messageEn: error.message || 'Failed to disconnect WhatsApp',
      messageTh: 'ล้มเหลวในการยกเลิกการเชื่อมต่อ',
      messageLa: 'ບໍ່ສາມາດຍົກເລີກການເຊື່ອມຕໍ່'
    });
  }
});

export default router;

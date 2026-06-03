import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../prisma';
import { authenticateToken, AuthRequest, adminOnly } from '../middlewares/auth';
import { NotificationService } from '../services/notification';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const router = Router();

// Initialize Stripe if secret is valid
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeSecretKey';
let stripe: Stripe | null = null;
if (stripeKey && !stripeKey.includes('Mock')) {
  stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16' as any,
  });
}

// Create Stripe Checkout Session
router.post('/stripe/create-session', authenticateToken, async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ messageEn: 'Order not found', messageTh: 'ไม่พบคำสั่งซื้อ' });
    }

    if (order.userId !== authReq.user.id) {
      return res.status(403).json({ messageEn: 'Access denied', messageTh: 'ปฏิเสธการเข้าถึง' });
    }

    // If Stripe is not configured or in mock mode, return a mock session URL
    if (!stripe) {
      console.log(`[STRIPE MOCK] Creating checkout session for order ${order.orderNumber}`);
      return res.json({
        id: `mock_session_${order.id}`,
        url: `http://localhost:3000/orders/${order.id}?status=paid&method=stripe&mock=true`,
      });
    }

    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'lak',
        product_data: {
          name: item.product.nameEn,
          description: item.product.descriptionEn,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents/satang
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:3000/orders/${order.id}?status=paid&method=stripe`,
      cancel_url: `http://localhost:3000/orders/${order.id}?status=cancelled&method=stripe`,
      client_reference_id: order.id,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Stripe error', messageTh: 'เกิดข้อผิดพลาดในการเชื่อมต่อ Stripe' });
  }
});

// Capture PayPal Payment
router.post('/paypal/capture', authenticateToken, async (req: Request, res: Response) => {
  const { orderId, paypalOrderId } = req.body;
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ messageEn: 'Order not found', messageTh: 'ไม่พบคำสั่งซื้อ' });
    }

    // Mock capture if PayPal keys are mock
    console.log(`[PAYPAL MOCK] Capturing order ${order.orderNumber} with PayPal Order ID ${paypalOrderId}`);

    // Update order status to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'PAID',
      },
    });

    // Send notification
    await NotificationService.sendStatusChange(prisma, order.userId, order.orderNumber, 'PAID');

    res.json({
      success: true,
      messageEn: 'PayPal payment captured successfully',
      messageTh: 'ชำระเงินผ่าน PayPal สำเร็จแล้ว',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'PayPal error', messageTh: 'เกิดข้อผิดพลาดในการเชื่อมต่อ PayPal' });
  }
});

const settingsPath = path.join(__dirname, '../../data/qr-settings.json');
const uploadDir = path.join(__dirname, '../../uploads');

import { uploadFile } from '../utils/storage';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, and PNG images are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const getQrSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read QR settings:', e);
  }
  return {
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BCELONE_QR_PATTIE_PLAY_SHOP",
    bankName: "Banque Pour Le Commerce Exterieur Lao (BCEL)",
    accountName: "PATTIE PLAY SHOP CO., LTD.",
    accountNumber: "160-12-00-0123456-001"
  };
};

const saveQrSettings = (settings: any) => {
  try {
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save QR settings:', e);
    return false;
  }
};

// Fetch QR payment codes details (BCEL One QR)
router.get('/qr-details', async (req: Request, res: Response) => {
  const settings = getQrSettings();
  res.json(settings);
});

// Update QR payment bank details (Admin Only)
router.put('/qr-details', authenticateToken, adminOnly, async (req: Request, res: Response) => {
  const { bankName, accountName, accountNumber } = req.body;
  if (!bankName || !accountName || !accountNumber) {
    return res.status(400).json({ messageEn: 'Incomplete settings data', messageTh: 'ข้อมูลการตั้งค่าไม่สมบูรณ์' });
  }

  const settings = getQrSettings();
  settings.bankName = bankName;
  settings.accountName = accountName;
  settings.accountNumber = accountNumber;

  if (saveQrSettings(settings)) {
    res.json(settings);
  } else {
    res.status(500).json({ messageEn: 'Failed to save settings', messageTh: 'ไม่สามารถบันทึกข้อมูลการตั้งค่าได้' });
  }
});

// Upload new QR Code image (Admin Only)
router.post('/qr-details/upload', authenticateToken, adminOnly, upload.single('qrCode'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ messageEn: 'Please upload an image file', messageTh: 'กรุณาอัปโหลดไฟล์รูปภาพ' });
  }

  // Upload file using storage helper
  const qrImageUrl = await uploadFile(req.file.buffer, req.file.originalname, 'qrcodes');
  const settings = getQrSettings();
  settings.qrImageUrl = qrImageUrl;

  if (saveQrSettings(settings)) {
    res.json({
      messageEn: 'QR Code image uploaded successfully',
      messageTh: 'อัปโหลดรูปภาพ QR Code เรียบร้อยแล้ว',
      settings,
    });
  } else {
    res.status(500).json({ messageEn: 'Failed to save settings', messageTh: 'ไม่สามารถบันทึกข้อมูลการตั้งค่าได้' });
  }
});

export default router;

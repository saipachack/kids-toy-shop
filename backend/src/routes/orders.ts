import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticateToken, adminOnly, AuthRequest } from '../middlewares/auth';
import { NotificationService } from '../services/notification';

const router = Router();

import { uploadFile } from '../utils/storage';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Helper to format product images inside order details
const formatOrderItem = (item: any) => {
  try {
    return {
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images),
      },
    };
  } catch (e) {
    return item;
  }
};

// Place a new Order (Customer)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const { items, shippingAddress, paymentMethod } = req.body; // items: [{ productId, quantity }]
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ messageEn: 'Incomplete order data', messageTh: 'ข้อมูลการสั่งซื้อไม่สมบูรณ์' });
  }

  try {
    // 1. Transaction to ensure stock validation and order creation
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const dbItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.nameEn} (Requested: ${item.quantity}, Available: ${product.stock})`);
        }

        // Decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        dbItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Generate order number KS-YYYYMMDD-Random
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randStr = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `KS-${dateStr}-${randStr}`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: authReq.user!.id,
          orderNumber,
          totalAmount,
          paymentMethod,
          shippingAddress,
          status: 'PENDING_PAYMENT',
          paymentStatus: 'PENDING',
          orderItems: {
            create: dbItemsToCreate,
          },
        },
        include: {
          orderItems: {
            include: { product: true },
          },
        },
      });

      return newOrder;
    });

    // 2. Notify customer and admin asynchronously (don't block response)
    NotificationService.sendStatusChange(prisma, authReq.user.id, result.orderNumber, 'PENDING_PAYMENT');
    NotificationService.notifyAdminNewOrder(prisma, result.orderNumber, result.totalAmount);

    res.status(201).json({
      ...result,
      orderItems: result.orderItems.map(formatOrderItem),
    });
  } catch (error: any) {
    res.status(400).json({ messageEn: error.message || 'Failed to place order', messageTh: error.message || 'ไม่สามารถทำรายการสั่งซื้อได้' });
  }
});

// GET all orders (Customer sees their own, Admin sees all)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  try {
    let orders;
    if (authReq.user.role === 'ADMIN') {
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: { name: true, email: true },
          },
          orderItems: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId: authReq.user.id },
        include: {
          orderItems: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const formattedOrders = orders.map((order) => ({
      ...order,
      orderItems: order.orderItems.map(formatOrderItem),
    }));

    res.json(formattedOrders);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// GET order by orderNumber (Customer or Admin)
router.get('/number/:orderNumber', authenticateToken, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      select: { id: true, userId: true }
    });

    if (!order) {
      return res.status(404).json({ messageEn: 'Order not found', messageTh: 'ไม่พบคำสั่งซื้อ' });
    }

    // Customer can only view their own order
    if (authReq.user.role !== 'ADMIN' && order.userId !== authReq.user.id) {
      return res.status(403).json({ messageEn: 'Access denied', messageTh: 'ปฏิเสธการเข้าถึง' });
    }

    res.json({ id: order.id });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// GET single order details (Customer or Admin)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        orderItems: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ messageEn: 'Order not found', messageTh: 'ไม่พบคำสั่งซื้อ' });
    }

    // Customer can only view their own orders, Admin can view any
    if (authReq.user.role !== 'ADMIN' && order.userId !== authReq.user.id) {
      return res.status(403).json({ messageEn: 'Access denied', messageTh: 'ปฏิเสธการเข้าถึง' });
    }

    res.json({
      ...order,
      orderItems: order.orderItems.map(formatOrderItem),
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// POST Upload bank slip receipt (Customer)
router.post('/:id/upload-slip', authenticateToken, upload.single('slip'), async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  if (!req.file) {
    return res.status(400).json({ messageEn: 'Please upload a file', messageTh: 'กรุณาเลือกไฟล์เพื่ออัปโหลด' });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ messageEn: 'Order not found', messageTh: 'ไม่พบคำสั่งซื้อ' });
    }

    if (order.userId !== authReq.user.id) {
      return res.status(403).json({ messageEn: 'Access denied', messageTh: 'ปฏิเสธการเข้าถึง' });
    }

    // Upload file using storage helper
    const slipUrl = await uploadFile(req.file.buffer, req.file.originalname, 'slips');

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        slipUrl,
        status: 'AWAITING_VERIFICATION',
        paymentStatus: 'PENDING', // Awaiting admin approval
      },
    });

    // Notify customer about verification
    await NotificationService.sendStatusChange(
      prisma,
      updatedOrder.userId,
      updatedOrder.orderNumber,
      'AWAITING_VERIFICATION'
    );

    res.json({
      messageEn: 'Slip uploaded successfully. Awaiting verification.',
      messageTh: 'อัปโหลดหลักฐานการโอนเงินเรียบร้อยแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// POST Upload courier shipping slip (Admin Only)
router.post('/:id/upload-shipping-slip', authenticateToken, adminOnly, upload.single('shippingSlip'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ messageEn: 'Please upload a shipping slip', messageTh: 'กรุณาเลือกสลิปขนส่งเพื่ออัปโหลด' });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ messageEn: 'Order not found', messageTh: 'ไม่พบคำสั่งซื้อ' });
    }

    // Upload file using storage helper
    const shippingSlipUrl = await uploadFile(req.file.buffer, req.file.originalname, 'shipping_slips');

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        shippingSlipUrl,
        status: 'SHIPPING', // Auto-advance to SHIPPING
      },
    });

    // Send notifications regarding status change
    await NotificationService.sendStatusChange(
      prisma,
      updatedOrder.userId,
      updatedOrder.orderNumber,
      'SHIPPING',
      updatedOrder.trackingNumber
    );

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// PUT update order status & tracking number (Admin Only)
router.put('/:id/status', authenticateToken, adminOnly, async (req: Request, res: Response) => {
  const { status, trackingNumber, paymentStatus } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ messageEn: 'Order not found', messageTh: 'ไม่พบคำสั่งซื้อ' });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    // If order changes status to paid, adjust paymentStatus accordingly
    if (status === 'PAID') {
      updateData.paymentStatus = 'PAID';
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Send notifications regarding status change
    await NotificationService.sendStatusChange(
      prisma,
      updatedOrder.userId,
      updatedOrder.orderNumber,
      updatedOrder.status,
      updatedOrder.trackingNumber
    );

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

export default router;

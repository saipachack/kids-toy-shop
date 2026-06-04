import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import whatsappRoutes from './routes/whatsapp';
import prisma from './prisma';
import { authenticateToken, adminOnly } from './middlewares/auth';
import { whatsapp } from './services/whatsapp';

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading images from different origins
}));
app.use(cors({
  origin: '*', // Allow all origins for dev/simplicity
  credentials: true,
}));
app.use(express.json());

// Serving uploaded bank slips
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { messageEn: 'Too many requests, please try again later.', messageTh: 'มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง' },
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// In-app Notifications endpoint (Customer & Admin)
app.get('/api/notifications', authenticateToken, async (req: any, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Admin Dashboard Metrics Route
app.get('/api/admin/metrics', authenticateToken, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Sales metrics
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
    });

    const salesToday = orders
      .filter((o) => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const salesThisMonth = orders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Count metrics
    const totalOrdersCount = await prisma.order.count();
    const pendingOrdersCount = await prisma.order.count({ where: { status: 'PENDING_PAYMENT' } });
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // 3. Low stock alert (stock <= 5)
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      include: { category: true },
    });

    // 4. Best sellers (based on order items quantity)
    const orderItems = await prisma.orderItem.findMany({
      include: { product: { include: { category: true } } },
    });

    const salesCountMap: { [productId: string]: { product: any; count: number } } = {};
    orderItems.forEach((item) => {
      if (item.product) {
        if (!salesCountMap[item.productId]) {
          salesCountMap[item.productId] = { product: item.product, count: 0 };
        }
        salesCountMap[item.productId].count += item.quantity;
      }
    });

    const bestSellers = Object.values(salesCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        id: item.product.id,
        nameEn: item.product.nameEn,
        nameTh: item.product.nameTh,
        nameLa: item.product.nameLa,
        price: item.product.price,
        stock: item.product.stock,
        category: item.product.category,
        soldCount: item.count,
        images: JSON.parse(item.product.images),
      }));

    // 5. Recent Monthly Sales Chart Data (Mocking last 6 months based on actual DB when possible)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    
    // Create chart array for last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonthIndex = (currentMonthIndex - i + 12) % 12;
      const targetYear = today.getFullYear() - (currentMonthIndex - i < 0 ? 1 : 0);
      
      const monthStart = new Date(targetYear, targetMonthIndex, 1);
      const monthEnd = new Date(targetYear, targetMonthIndex + 1, 0, 23, 59, 59, 999);

      const monthOrders = orders.filter(
        (o) => new Date(o.createdAt) >= monthStart && new Date(o.createdAt) <= monthEnd
      );
      const monthSales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      chartData.push({
        month: months[targetMonthIndex],
        sales: monthSales,
        orders: monthOrders.length,
      });
    }

    res.json({
      salesToday,
      salesThisMonth,
      totalSales,
      totalOrdersCount,
      pendingOrdersCount,
      customerCount,
      lowStockProducts: lowStockProducts.map((p) => {
        try {
          return { ...p, images: JSON.parse(p.images) };
        } catch (e) {
          return { ...p, images: [] };
        }
      }),
      bestSellers,
      chartData,
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// App Entry
app.listen(PORT, async () => {
  console.log(`Pattie Play Shop Server is running on port ${PORT}`);
  // Initialize WhatsApp service to auto-resume active sessions
  try {
    await whatsapp.init();
  } catch (error) {
    console.error('[WhatsApp] Auto-init failed:', error);
  }
});

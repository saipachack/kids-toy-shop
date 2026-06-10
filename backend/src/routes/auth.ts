import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { whatsapp } from '../services/whatsapp';
import { sendOtpEmail } from '../services/email';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_kids_shop_jwt_token_key_987654321';

// Register Customer/Admin
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, phone, address, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ messageEn: 'Please enter all required fields', messageTh: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ messageEn: 'User already exists', messageTh: 'มีผู้ใช้งานอีเมลนี้แล้วในระบบ' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Auto-bootstrap first user as ADMIN or if email starts with admin
    let userRole = 'CUSTOMER';
    const userCount = await prisma.user.count();
    if (userCount === 0 || email.toLowerCase().startsWith('admin') || role === 'ADMIN') {
      userRole = 'ADMIN';
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        role: userRole,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ messageEn: 'Please enter all fields', messageTh: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ messageEn: 'Invalid email or password', messageTh: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ messageEn: 'Invalid email or password', messageTh: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Google Login Mock
router.post('/google-login', async (req: Request, res: Response) => {
  const { email, name, googleId } = req.body;

  if (!email || !name) {
    return res.status(400).json({ messageEn: 'Invalid Google sign in payload', messageTh: 'ข้อมูลการเข้าสู่ระบบ Google ไม่ถูกต้อง' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user with a dummy hashed password
      const dummyPassword = await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10);
      let userRole = 'CUSTOMER';
      if (email.toLowerCase().startsWith('admin')) {
        userRole = 'ADMIN';
      }

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: dummyPassword,
          role: userRole,
        },
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Get Current User (me)
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ messageEn: 'User not found', messageTh: 'ไม่พบข้อมูลผู้ใช้' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  const { name, phone, address } = req.body;
  const authReq = req as AuthRequest;
  if (!authReq.user) return res.status(401).json({ messageEn: 'Unauthorized', messageTh: 'ไม่ได้รับอนุญาต' });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: authReq.user.id },
      data: {
        name,
        phone,
        address,
      },
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Forgot Password Mock
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ messageEn: 'Email is required', messageTh: 'จำเป็นต้องระบุอีเมล' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ messageEn: 'User with this email does not exist', messageTh: 'ไม่พบผู้ใช้ที่ใช้อีเมลนี้ในระบบ' });
    }

    // Simulate sending password reset email
    console.log(`\n================ PASSWORD RESET SIMULATOR ================`);
    console.log(`[EMAIL SENT TO ${email}] Password reset request`);
    console.log(`Reset Link: http://localhost:3000/reset-password?token=mock_reset_token_${user.id}`);
    console.log(`==========================================================\n`);

    res.json({
      messageEn: 'Password reset link sent to your email (check console output for link)',
      messageTh: 'ส่งลิงก์สำหรับตั้งค่ารหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว (ตรวจสอบที่คอนโซลของเซิร์ฟเวอร์)',
    });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// Send OTP via Email or fall back to mock console output
router.post('/send-otp', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      messageEn: 'Email address is required',
      messageTh: 'จำเป็นต้องระบุอีเมล',
      messageLa: 'ຈຳເປັນຕ້ອງລະບຸອີເມວ'
    });
  }

  try {
    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Delete any existing code for this email address to prevent duplicates
    await prisma.emailVerification.deleteMany({ where: { email } });

    // Save new verification to database
    await prisma.emailVerification.create({
      data: {
        email,
        code,
        expiresAt
      }
    });

    // Try sending via real email
    const sentReal = await sendOtpEmail(email, code);

    if (sentReal) {
      return res.json({
        success: true,
        messageEn: 'OTP code sent via Email',
        messageTh: 'ส่งรหัส OTP ทางอีเมลแล้ว',
        messageLa: 'ສົ່ງລະຫັດ OTP ທາງອີເມວແລ້ວ'
      });
    } else {
      // Fallback mock mode if SMTP is not configured
      return res.json({
        success: true,
        mock: true,
        code,
        messageEn: 'Email service is running in mock mode. OTP code is displayed below.',
        messageTh: 'บริการอีเมลอยู่ในโหมดจำลอง แสดงรหัสผ่านหน้าจอดังนี้',
        messageLa: 'ບໍລິການອີເມວຢູ່ໃນໂໝດຈຳລອງ ສະແດງລະຫັດເທິງໜ້າຈໍດັ່ງນີ້'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      messageEn: error.message || 'Server error',
      messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
      messageLa: 'ເກີດຂໍ້ຜິດພາດຈາກເຊີເວີ'
    });
  }
});

// Verify OTP Code
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      messageEn: 'Email and verification code are required',
      messageTh: 'จำเป็นต้องระบุอีเมลและรหัสยืนยัน',
      messageLa: 'ຈຳເປັນຕ້ອງລະບຸອີເມວ ແລະ ລະຫັດຢືນຢັນ'
    });
  }

  try {
    const verification = await prisma.emailVerification.findUnique({
      where: { email }
    });

    const invalidError = {
      success: false,
      messageEn: 'Invalid or expired OTP verification code',
      messageTh: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ',
      messageLa: 'ລະຫັດ OTP ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ'
    };

    if (!verification) {
      return res.status(400).json(invalidError);
    }

    if (verification.code !== code) {
      return res.status(400).json(invalidError);
    }

    if (new Date() > verification.expiresAt) {
      // Delete expired code
      await prisma.emailVerification.delete({ where: { email } });
      return res.status(400).json(invalidError);
    }

    // Success! Delete the verified record
    await prisma.emailVerification.delete({ where: { email } });

    res.json({
      success: true,
      messageEn: 'Email verified successfully',
      messageTh: 'ยืนยันอีเมลสำเร็จ',
      messageLa: 'ຢືນຢັນອີເມວສຳເລັດ'
    });
  } catch (error: any) {
    res.status(500).json({
      messageEn: error.message || 'Server error',
      messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
      messageLa: 'ເກີດຂໍ້ຜິດພາດຈາກເຊີເວີ'
    });
  }
});

export default router;

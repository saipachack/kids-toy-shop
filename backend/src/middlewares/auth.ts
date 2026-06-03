import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_kids_shop_jwt_token_key_987654321';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ messageEn: 'Access token required', messageTh: 'จำเป็นต้องใช้ Access Token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ messageEn: 'Invalid or expired token', messageTh: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user || authReq.user.role !== 'ADMIN') {
    return res.status(403).json({ messageEn: 'Admin access required', messageTh: 'ต้องการสิทธิ์ผู้ดูแลระบบ' });
  }
  next();
};

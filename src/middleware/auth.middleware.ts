import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ratos_default_secret';

interface AuthPayload {
  id: string;
  role: 'CLIENT' | 'RESTAURATEUR';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
}

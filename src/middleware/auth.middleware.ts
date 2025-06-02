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

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format "Bearer token"

  if (!token) {
    res.status(401).json({ error: 'Token manquant' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Token invalide ou expiré' });
    return;
  }
}

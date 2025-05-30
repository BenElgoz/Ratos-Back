import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/hash';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ratos_default_secret';

// POST /signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, role, firstName, lastName, phoneNumber, restaurant } = req.body;
    
    if (!email || !username || !password || !role) {
      res.status(400).json({ error: 'Champs requis manquants.' });
      return;
    }
    
    const existing = await prisma.user.findFirst({ 
      where: { 
        OR: [{ email }, { username }] 
      } 
    });
    
    if (existing) {
      res.status(409).json({ error: 'Email ou username déjà utilisé.' });
      return;
    }
    
    const hashedPassword = await hashPassword(password);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
        role: role as Role,
      },
    });
    
    if (role === 'CLIENT') {
      await prisma.clientProfile.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
        },
      });
    }
    
    if (role === 'RESTAURATEUR') {
      const profile = await prisma.restaurateurProfile.create({
        data: {
          userId: newUser.id,
          phoneNumber,
        },
      });
      
      await prisma.restaurant.create({
        data: {
          restaurateurId: profile.id,
          name: restaurant?.name,
          description: restaurant?.description,
          address: restaurant?.address,
          latitude: restaurant?.latitude,
          longitude: restaurant?.longitude,
          // openingHours: JSON.parse(restaurant?.openingHours || '{}'),
          openingHours: restaurant?.openingHours || '{}',
          googleMapsUrl: restaurant?.googleMapsUrl,
          mainImageUrl: restaurant?.mainImageUrl,
        },
      });
    }
    
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ token, role: newUser.role });
  } catch (err: any) {
  console.error('❌ SIGNUP ERROR:', err.message, err.stack);
  res.status(500).json({ error: 'Erreur serveur.', details: err.message });
}
});

// POST /login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400).json({ error: 'Champs requis manquants.' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    const passwordValid = await comparePassword(password, user.hashedPassword);
    if (!passwordValid) {
      res.status(401).json({ error: 'Mot de passe incorrect.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;

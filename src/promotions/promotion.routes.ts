import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get(
  '/promotions/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const offer = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!offer) {
      res.status(404).json({ error: 'Offre introuvable' });
      return;
    }

    res.json(offer);
  }
);

router.put(
  '/promotions/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
      title,
      description,
      startDate,
      endDate,
      imageUrl,
      offerType,
      schedule,
    } = req.body;

    try {
      const updated = await prisma.promotion.update({
        where: { id },
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          imageUrl,
          offerType,
          schedule,
        },
      });

      res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
    }
  }
);

router.post(
  '/promotions',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        schedule,
        imageUrl,
        offerType,
      } = req.body;

      const userId = req.user?.id;

      // Validation basique
      if (!title || !description || !startDate || !endDate) {
        res.status(400).json({ error: 'Champs requis manquants.' });
        return;
      }

      // Trouver le restaurant lié à ce restaurateur
      const restaurant = await prisma.restaurant.findFirst({
        where: { restaurateur: { userId } },
      });

      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant introuvable pour ce restaurateur.' });
        return;
      }

      const promotion = await prisma.promotion.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          schedule,
          imageUrl,
          offerType,
          restaurantId: restaurant.id,
        },
      });

      res.status(201).json(promotion);
    } catch (err) {
      console.error('❌ ERREUR création offre :', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

export default router;

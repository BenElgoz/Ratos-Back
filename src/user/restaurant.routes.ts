import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// ROUTE PUBLIQUE : liste des restaurants pour la carte
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        address: true,
      },
    });
    res.json(restaurants);
  } catch (err) {
    console.error('❌ ERREUR /restaurants :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ROUTE PUBLIQUE : détails d’un restaurant par ID
router.get(
  '/restaurants/:id',
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
          promotions: {
            where: { active: true },
            orderBy: { startDate: 'desc' },
            select: {
              id: true,
              title: true,
              description: true,
              imageUrl: true,
            },
          },
        },
      });

      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant non trouvé' });
        return;
      }

      res.status(200).json({
        name: restaurant.name,
        mainImageUrl: restaurant.mainImageUrl,
        promotions: restaurant.promotions,
      });
    } catch (err) {
      console.error('❌ ERREUR /restaurants/:id :', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// ROUTE PRIVÉE : infos du restaurateur + promos actives
router.get(
  '/restaurant/me',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Non autorisé' });
        return;
      }

      const profile = await prisma.restaurateurProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        res.status(404).json({ error: 'Profil restaurateur introuvable' });
        return;
      }

      const restaurant = await prisma.restaurant.findFirst({
        where: { restaurateurId: profile.id },
        include: {
          promotions: {
            where: { active: true },
            orderBy: { startDate: 'desc' },
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              imageUrl: true,
              offerType: true,
            },
          },
        },
      });

      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant introuvable' });
        return;
      }

      res.status(200).json({
        name: restaurant.name,
        mainImageUrl: restaurant.mainImageUrl,
        promotions: restaurant.promotions,
      });
    } catch (err) {
      console.error('❌ ERREUR /restaurant/me :', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);


export default router;

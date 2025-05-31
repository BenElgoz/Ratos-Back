import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        address: true,
      }
    })
    res.json(restaurants)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

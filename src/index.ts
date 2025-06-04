import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import restaurantRoutes from './user/restaurant.routes'
import promotionRoutes from './promotions/promotion.routes';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000', 
  'https://ratos.fr/',
  'https://ratos.fr/',
  'http://www.ratos.fr/',
  'https://www.ratos.fr/',
  'http://landing.ratos.fr/',
  'https://landing.ratos.fr/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', restaurantRoutes)
app.use('/', promotionRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('RATOS BACK 🧀 API is running 🚀');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

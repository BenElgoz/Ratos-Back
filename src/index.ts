import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
// import protectedRoutes from './protected/protected.routes';

dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
}));app.use(express.json());

app.use('/auth', authRoutes);
// app.use('/api/protected', protectedRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('RATOS BACK 🧀 API is running 🚀');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

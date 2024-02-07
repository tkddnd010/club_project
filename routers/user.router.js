import express from 'express';
import { prisma } from '../model/index.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hi');
});

export default router;

import express from 'express';
import { prisma } from '../model/index.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello');
});

export default router;

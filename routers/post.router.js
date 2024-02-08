import express from 'express';
import { prisma } from '../model/index.js';
import authomiddleware from '../middlewares/authomiddleware.js';

const router = express.Router();

// 게시물 작성 API
router.post('/', authomiddleware, async (req, res, next) => {
  const { title, image, interest, content, location } = req.body;
  const { userId } = req.user;

  const post = await prisma.posts.create({
    data: {
      userId: +userId,
      title,
      image,
      interest,
      content,
      location,
    },
  });
  return res.status(201).json({ data: post });
});

// 게시물 조회 API
router.get('/', async (req, res, next) => {
  const posts = await prisma.posts.findMany({
    select: {
      postId: true,
      userId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return res.status(200).json({ data: posts });
});

export default router;

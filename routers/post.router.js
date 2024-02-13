import express from 'express';
import { prisma } from '../model/index.js';
import {
  createAccessToken,
  validateAccessToken,
} from '../middlewares/authomiddleware.js';

const router = express.Router();

// 게시물 작성 API

router.post('/', validateAccessToken, async (req, res, next) => {
  const { title, image, content, like } = req.body;
  const { userId } = req.user;

  const post = await prisma.posts.create({
    data: {
      userId: +userId,
      title,
      image,
      content,
      like,
    },
  });

  return res.status(201).json({ message: '게시물이 작성 되었습니다!' });
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

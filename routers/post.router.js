import express from 'express';
import { prisma } from '../model/index.js';
import {
  createAccessToken,
  validateAccessToken,
} from '../middlewares/authomiddleware.js';

const router = express.Router();

// 게시물 작성 API
router.post('/', validateAccessToken, async (req, res, next) => {
  const { title, image, interest, content, location } = req.body;
  const { userId } = req.user;

  const post = await prisma.posts.create({
    data: {
      userId: +userId, // 사용자 구분용도(필수)
      title: title,
      image: image,
      interest: interest,
      content: content,
    },
  });

  return res.status(201).json({ message: '게시물이 작성되었습니다.' });
});

// 게시물 조회 API
router.get('/', async (req, res, next) => {
  const posts = await prisma.posts.findMany({
    select: {
      postId: true,
      title: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.status(200).json({ data: posts });
});

// 게시물 상세 조회 API
router.get('/:postId', async (req, res, next) => {
  const { postId } = req.params;
  const post = await prisma.posts.findFirst({
    where: { postId: +postId },
    select: {
      postId: true,
      title: true,
      image: true,
      createdAt: true,
      content: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return res.status(200).json({ data: post });
});

// 게시물 수정 API
router.put('/:postId', validateAccessToken, async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.uers;
  const { title, image, interest, content, location } = req.body;

  await prisma.posts.create({
    data: {
      title,
      image,
      interest,
      content,
      location,
    },
  });

  return res.status(201).json({ message: '게시물이 수정되었습니다.' });
});

// 게시물 삭제 API
router.delete('/posts');

export default router;

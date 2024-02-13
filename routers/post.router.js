import express from 'express';
import { prisma } from '../model/index.js';
import {
  createAccessToken,
  validateAccessToken,
} from '../middlewares/authomiddleware.js';

const router = express.Router();

// 게시물 작성 API
router.post('/', validateAccessToken, async (req, res, next) => {
  const { title, image, content } = req.body;
  const { userId } = req.user;

  const post = await prisma.posts.create({
    data: {
      userId: +userId, // 사용자 구분용도(필수)
      title: title,
      image: image,
      content: content,
    },
  });

  return res.status(201).json({ message: '게시물이 작성 되었습니다!' });
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
  const { userId } = req.user;
  const { title, image, content } = req.body;

  const post = await prisma.posts.findFirst({
    // 내가 찾고자하는 게시물 한 개 찾기.
    where: { postId: +postId },
  });

  if (!post) {
    return res.status(404).json({ message: '게시물이 존재하지 않습니다.' });
  }

  await prisma.posts.update({
    data: {
      title,
      image,
      content,
    },
    where: { postId: +postId, userId: +userId },
  });

  return res.status(201).json({ message: '게시물이 수정되었습니다.' });
});

// 게시물 삭제 API
router.delete('/:postId', validateAccessToken, async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.user;
  const post = await prisma.posts.findFirst({
    where: { postId: +postId },
  });
  if (!post) {
    return res
      .status(404)
      .json({ message: '삭제할 게시물이 존재하지 않습니다.' });
  }
  await prisma.posts.delete({
    where: { postId: +postId, userId: +userId },
  });
  return res.json({ message: '게시물이 삭제되었습니다.' });
});

export default router;

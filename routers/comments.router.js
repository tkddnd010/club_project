import express from 'express';
import { prisma } from '../model/index.js';
import authMiddleware from '../middlewares/authomiddleware.js';

const router = express.Router();

router.post(
  '/posts/:postId/comments',
  authMiddleware,
  async (req, res, next) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { userId } = req.user;

    const post = await prisma.posts.findFirst({ where: { postId: +postId } });
    if (!post) return res.status(404).json({ message: '댓글이 없습니다.' });

    const comment = await prisma.comments.create({
      data: {
        postId: +postId,
        userId: +userId,
        content: content,
      },
    });
    return res.status(201).json({ data: comment });
  }
);

router.get('/posts/:postId/comments', async (req, res, next) => {
  const { postId } = req.params;

  const comments = await prisma.comments.findMany({
    where: { postId: +postId },
    orderBy: { createdAt: 'desc' },
  });
  return res.status(200).json({ data: comments });
});

export default router;

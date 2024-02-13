import express from 'express';
import { prisma } from '../model/index.js';
import {
  createAccessToken,
  validateAccessToken,
} from '../middlewares/authomiddleware.js';

const router = express.Router();

// 댓글 생성 API
router.post(
  '/:postId/comments',
  validateAccessToken,
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
    return res.status(201).json({ message: '댓글이 작성되었습니다.' });
  }
);

// 댓글 조회 API

router.get('/:postId/comments', async (req, res, next) => {
  const { postId } = req.params;

  const comments = await prisma.comments.findMany({
    where: { postId: +postId },
    select: {
      content: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      content: true,
      createdAt: true,
    },
  });
  return res.status(200).json({ data: comments });
});

// 댓글 수정 API
router.put(
  '/:postId/comments/:commentId',
  validateAccessToken,
  async (req, res, next) => {
    const { commentId } = req.params;
    const { userId } = req.user;

    const { content } = req.body;
    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });

    if (!comment)
      return res.status(404).json({ message: '수정할 내용이 없습니다.' });
    await prisma.comments.update({
      data: {
        content,
      },
      where: { commentId: +commentId, userId: +userId },
    });

    return res.status(200).json({ message: '댓글이 수정되었습니다.' });
  }
);

// 댓글 삭제 API
router.delete(
  '/:postId/comments/:commentId',
  validateAccessToken,
  async (req, res, next) => {
    const { commentId } = req.params;
    const { userId } = req.user;

    const content = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });
    if (!content)
      return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });

    await prisma.comments.delete({
      where: { commentId: +commentId, userId: +userId },
    });

    return res.status(200).json({ message: '댓글이 삭제되었습니다.' });
  }
);

export default router;

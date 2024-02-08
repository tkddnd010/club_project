import express from 'express';
import { prisma } from '../model/index.js';
import {
  createAccessToken,
  validateAccessToken,
} from '../middlewares/authomiddleware.js';

const router = express.Router();

// 댓글 생성 API
router.post(
  '/posts/:postId/comments',
  validateAccessToken,
  async (req, res, next) => {
    const { commentId } = req.params;
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

// 댓글 조회 API
router.get('/:postId/comments', async (req, res, next) => {
  const { commentId } = req.params;

  const comments = await prisma.comments.findMany({
    where: { postId: +postId },
    orderBy: { createdAt: 'desc' },
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
    const currentContent = await prisma.comments.findById(commentId).exec();

    if (!currentContent) {
      return res.status(404).json({ errMessage: '수정할 내용이 없습니다.' });
    }

    if (content) {
      const targetContent = await prisma.comments.findOne({ content }).exec();
      if (targetContent) {
        targetContent.content = currentContent.content;
        await targetContent.save();
      }

      currentContent.content = content;
    }

    await currentContent.save();

    return res.status(200).json({});
  }
);

// 댓글 삭제 API
router.delete(
  '/:postId/comments/:commentId',
  validateAccessToken,
  async (req, res, next) => {
    const { commentId } = req.params;
    const { userId } = req.user;

    const content = await prisma.comments.findById(commentId).exec();
    if (!content) {
      return res.status(404).json({ errMessage: '댓글이 존재하지 않습니다.' });
    }

    await prisma.comments.delete({ _id: commentId });

    return res.status(200).json({ message: '댓글이 삭제되었습니다.' });
  }
);

export default router;
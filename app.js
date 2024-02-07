import express from 'express';
import cookieParser from 'cookie-parser';
import userRouter from './routers/user.router.js';
import postsRouter from './routers/post.router.js';
import commentsRouter from './routers/comments.router.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/user', userRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸습니다.');
});

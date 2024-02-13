import express from 'express';
import { prisma } from '../model/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createAccessToken,
  validateAccessToken,
} from '../middlewares/authomiddleware.js';

const router = express.Router();

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
  try {
    const {
      email,
      password,
      passwordchek,
      name,
      age,
      gender,
      interest,
      selfInfo,
    } = req.body;

    if (!(password.length >= 6))
      return res
        .status(400)
        .json({ message: '비밀번호는 6자리 이상을 입력해주세요' });

    if (password !== passwordchek)
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다' });

    const user = await prisma.users.findFirst({
      where: { email },
    });

    if (user)
      return res.status(409).json({ message: '이미 가입된 이메일입니다.' });

    const hashpassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        email,
        password: hashpassword,
        name,
        age,
        gender,
        interest,
        selfInfo,
      },
    });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user)
    return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  // 엑세스 토큰 생성!!
  if (!createAccessToken(res, user.userId)) {
    return res
      .status(401)
      .json({ message: 'ACCESS Token을 발급받지 못했습니다.' });
  }
  return res.status(200).json({ message: '로그인에 성공하였습니다.' });
});

// 로그아웃 API
router.delete('/sign-out', async (req, res, next) => {
  res.setHeader(
    'Set-Cookie',
    'accessToken=; path=/; expires=Thu, Jan 1970 00:00:00 GMT; httponly'
  );
  res.status(204).end();
});

// 프로필 조회 API
router.get('/me', validateAccessToken, async (req, res, next) => {
  const { userId } = req.user;
  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      name: true,
      age: true,
      gender: true,
      interest: true,
      selfInfo: true,
    },
  });

  return res.status(200).json({ data: user });
});

export default router;

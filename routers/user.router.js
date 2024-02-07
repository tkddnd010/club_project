import express from 'express';
import { prisma } from '../model/index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

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

export default router;

import express from 'express';
import { prisma } from '../model/index.js';
import bcrypt from 'bcrypt';
import { transPort } from '../mail/autoMail.js';
import {
  createAccessToken,
  validateAccessToken,
} from '../middlewares/authomiddleware.js';

const router = express.Router();

// 인증메일 발송 API
router.post('/authmail', async (req, res, next) => {
  const { email } = req.body;

  const generateRandom = function (min, max) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
  };

  const number = generateRandom(100000, 999999);

  await prisma.users.create({
    data: {
      email,
      token: number,
    },
  });

  const mailOptions = {
    from: 'tkddnd010@naver.com',
    to: email,
    subject: '이메일 인증번호입니다.',
    text: '인증코드' + number,
  };

  transPort.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json({ ok: false, message: '메일 전송에 실패했습니다.' });
      transPort.close();
    } else {
      res.json({
        ok: true,
        message: '메일 전송에 성공하였습니다.',
        authNum: number,
      });
      transPort.close();
    }
  });
});

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
  try {
    const {
      email,
      authonum,
      password,
      passwordcheck,
      name,
      age,
      gender,
      interest,
      selfInfo,
    } = req.body;

    if (
      !(
        password &&
        passwordcheck &&
        name &&
        age &&
        gender &&
        interest &&
        selfInfo
      )
    )
      return res.status(400).json({ message: '필수 입력값들을 입력해주세요.' });

    if (!(password.length >= 6))
      return res
        .status(400)
        .json({ message: '비밀번호는 6자리 이상을 입력해주세요' });

    if (password !== passwordcheck)
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다' });

    const user = await prisma.users.findFirst({
      where: { email },
    });

    if (user) {
      if (user.status === '승인')
        return res.status(409).json({ message: '이미 가입된 이메일입니다' });
    }

    if (user.token !== authonum)
      return res.status(400).json({ message: '인증코드가 일치하지 않습니다.' });

    const hashpassword = await bcrypt.hash(password, 10);

    await prisma.users.update({
      where: { email },
      data: {
        password: hashpassword,
        name,
        age,
        gender,
        interest,
        selfInfo,
        status: '승인',
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
  if (!bcrypt.compare(password, user.password))
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

// 프로필 수정 API
router.put('/me', validateAccessToken, async (req, res, next) => {
  const { userId } = req.user;
  const { name, interest, selfInfo, password, passwordcheck } = req.body;

  if (password && passwordcheck) {
    if (password !== passwordcheck) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    await prisma.users.update({
      where: { userId: +userId },
      data: {
        name,
        interest,
        selfInfo,
        password: hashpassword,
      },
    });
  } else {
    await prisma.users.update({
      where: { userId: +userId },
      data: {
        name,
        interest,
        selfInfo,
      },
    });
  }

  return res.status(200).json({ message: '수정이 완료되었습니다.' });
});

export default router;

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '../model/index.js';
dotenv.config();

function createAccessToken(res, id) {
  const accessToken = jwt.sign(
    { id: id },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: '12h' }
  );
  res.cookie('accessToken', accessToken);
  return accessToken;
}

async function validateAccessToken(req, res, next) {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return res
      .status(400)
      .json({ message: 'Access Token이 존재하지 않습니다.' });
  }
  const payload = validateToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET_KEY
  );
  if (!payload) {
    return res
      .status(401)
      .json({ message: 'Access Token이 유효하지 않습니다.' });
  }
  const userId = payload.id;
  const user = await prisma.Users.findFirst({ where: { userId: userId } });
  if (!user) {
    return res
      .status(401)
      .json({ message: 'Token 사용자가 존재하지 않습니다.' });
  }
  req.user = user;
  next();
}

function validateToken(token, secretkey) {
  try {
    const payload = jwt.verify(token, secretkey);
    return payload;
  } catch (error) {
    return null;
  }
}

export { createAccessToken, validateAccessToken };

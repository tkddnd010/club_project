import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transPort = nodemailer.createTransport({
  service: 'naver',
  host: 'smtp.naver.com',
  port: 465,
  secure: false,
  auth: {
    user: process.env.USERID,
    pass: process.env.PASSWORD,
  },
});

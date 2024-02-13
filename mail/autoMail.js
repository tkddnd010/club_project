import nodemailer from 'nodemailer';

export const transPort = nodemailer.createTransport({
  service: 'naver',
  host: 'smtp.naver.com',
  port: 465,
  secure: false,
  auth: {
    user: 'tkddnd010@naver.com',
    pass: 'tkddnd!!.0302',
  },
});

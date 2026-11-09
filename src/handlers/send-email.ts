import nodemailer from 'nodemailer';
import { Request } from 'express';
import axios from 'axios';

const sendEmail = async (req: Request) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAILSERVER,
      pass: process.env.EMAILPASS
    }
  });
  const mailOptions = {
    from: process.env.EMAILSERVER,
    to: process.env.EMAILROUTEE,
    subject: 'Email From: ' + req.body.data.name,
    text: `Name: ${req.body.data.name}\nEmail: ${req.body.data.email}\n\nSubject: ${req.body.data.message}`
  };
  const apiUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_API_TOKEN}&response=${req.body.data.captcha}`;

  try {
    const captchaResponse = await axios.post(apiUrl);
    const captchaData = captchaResponse.data;
    if (!captchaData.success) throw new Error('ReCAPTCHA verification failed');
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  } catch (error: any) {
    console.error('ReCAPTCHA API call failed:', error.message);
  }
}

export default sendEmail;

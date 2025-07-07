import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import pathFinder from '../src/utils/pathFinder.js';
dotenv.config();
pathFinder();

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    secure: 'false',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

// Verify as soon as app starts
transporter.verify()
    .then(() => console.log('⚡️ Mailer is ready'))
    .catch(err => console.error('❌ Mailer error:', err));
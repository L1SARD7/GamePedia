import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: config.GOOGLE_APP.USER,
        pass: config.GOOGLE_APP.PASSWORD,
    },
});

export const emailAdapter = {
    async sendConfirmationCode(email: string, confirmationCode: string, userId: string) {
        await transporter.sendMail({
            from: '"GamePedia" <twoakaynt0@gmail.com>',
            to: email,
            subject: 'Підтвердіть свою електронну адресу.',
            html: `<h1>Підтвердження адреси електронної пошти</h1> 
        Щоб підтвердити адрес електронної пошти перейдіть за наступним посиланням: <a href="${config.BASE_URL}/registration/confirmEmail/${confirmationCode}?userId=${userId}">Посилання (Натисніть на цей текст)</a>
        Якщо ви не реєструвались в нашому сервісі, проігноруйте це повідомлення.`,
        });
    },
};

import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_APP_USER,
    pass: process.env.GOOGLE_APP_PASSWORD
  },
});

export const emailAdapter = {
    async sendConfirmationCode(email: string, confirmationCode: string, userId: number) {
        const info = await transporter.sendMail({
        from: '"GamePedia" <twoakaynt0@gmail.com>',
        to: email,
        subject: "Підтвердіть свою електронну адресу.",
        html: `<h1>Підтвердження адреси електронної пошти</h1> 
        Щоб підтвердити адрес електронної пошти перейдіть за наступним посиланням: <a href="http://localhost:1235/registration/confirmEmail/${confirmationCode}?userId=${userId}">Посилання (Натисніть на цей текст)</a>
        Якщо ви не реєструвались в нашому сервісі, проігноруйте це повідомлення.`, 
  });
    }
}


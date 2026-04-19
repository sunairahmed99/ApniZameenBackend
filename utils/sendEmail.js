import nodemailer from 'nodemailer';

const sendEmail = async (options) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.Gmailuser,
            pass: process.env.Gmailpassword,
        },
    });

    const message = {
        from: `ZameenPro <${process.env.Gmailuser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(message);


};

export default sendEmail;


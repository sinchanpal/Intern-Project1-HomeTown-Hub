import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    }
});


const sendMail = async (to, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `${process.env.EMAIL}`, // sender address
            to, // list of recipients
            subject: "Reset Your Password", // subject line
            html: `<p>Your OTP for password reset is: <b>${otp}</b>. It's expires in 5 minutes.</p>`, // HTML body
        });

        console.log("Message sent: %s", info.messageId);

    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}


export default sendMail;
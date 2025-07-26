import nodemailer from "nodemailer";

export async function sendResetEmail(to, resetLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "Reset your password",
    text: `Click this link to reset your password: ${resetLink}`,
    html: `<p>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
  });
} 
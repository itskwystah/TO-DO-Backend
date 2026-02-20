import { sendEmail } from "@/utils/mailer/mail";

export const sendForgotPasswordOtpEmail = async (
  email: string,
  otp: string
) => {
  await sendEmail({
    to: email,
    subject: "Your Password Reset OTP",
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <h3>Password Reset OTP with 6 digit code</h3>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This OTP will expire in <b>10 minutes</b>.</p>
    `,
  });
};

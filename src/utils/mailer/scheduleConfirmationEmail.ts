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
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; color:#333;">Password Reset Request</h2>
            </td>
          </tr>

          <tr>
            <td style="color:#555; font-size:14px; padding-bottom:20px;">
              We received a request to reset your password. Use the verification code below to continue:
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 0;">
              <div style="
                display:inline-block;
                background-color:#f1f3f5;
                padding:15px 30px;
                font-size:28px;
                letter-spacing:8px;
                font-weight:bold;
                color:#111;
                border-radius:6px;
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <tr>
            <td style="color:#777; font-size:13px; padding-top:10px;">
              This code will expire in <strong>10 minutes</strong>.
            </td>
          </tr>

          <tr>
            <td style="color:#777; font-size:13px; padding-top:20px;">
              If you did not request a password reset, please ignore this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
};

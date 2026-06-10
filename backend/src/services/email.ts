import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || '"Pattie Play Shop" <no-reply@pattieplayshop.com>';

export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const isSmtpConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS;

  if (!isSmtpConfigured) {
    console.log(`\n======================================================`);
    console.log(`[Email Mock Service] Simulated Email OTP sent successfully!`);
    console.log(`Recipient: ${email}`);
    console.log(`OTP Code:  ${code}`);
    console.log(`======================================================\n`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for port 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: '🔑 [Pattie Play Shop] Your Registration OTP Verification Code',
      text: `Your registration verification code is: ${code}. This code is valid for 5 minutes.`,
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; font-weight: 900; color: #ec4899; margin: 0; letter-spacing: -0.5px;">PATTIE PLAY SHOP</h1>
            <p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-top: 5px; letter-spacing: 1.5px;">Registration Verification</p>
          </div>
          
          <div style="margin-bottom: 30px; line-height: 1.6; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">ສະບາຍດີ / Hello,</p>
            <p style="margin: 0 0 20px 0;">ຂອບໃຈທີ່ລົງທະບຽນກັບພວກເຮົາ. ກະລຸນານຳໃຊ້ລະຫັດ OTP ດ້ານລຸ່ມນີ້ເພື່ອຢືນຢັນການລົງທະບຽນຂອງທ່ານ:</p>
            <p style="margin: 0 0 20px 0;">Thank you for registering with us. Please use the following One-Time Passcode (OTP) to verify your account registration:</p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #fdf2f8; border: 1px dashed #fbcfe8; border-radius: 16px;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #db2777; display: block; margin-bottom: 5px;">${code}</span>
              <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Valid for 5 minutes</span>
            </div>
            
            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 12px;">ຫາກທ່ານບໍ່ໄດ້ຮ້ອງຂໍລະຫັດນີ້, ກະລຸນາເມີນເສີຍອີເມວສະບັບນີ້.</p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">If you did not request this verification code, please ignore this email.</p>
          </div>
          
          <div style="border-t: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0;">&copy; 2026 Pattie Play Shop. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Real Email OTP sent successfully to: ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${email}:`, error);
    return false;
  }
}

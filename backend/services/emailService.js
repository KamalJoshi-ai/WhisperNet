const {Resend} = require("resend");
const resend = new Resend(process.env.RESEND_API);

const sendOtpToEmail =async(email,otp)=>{
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #075e54;"> WhisperNet Web Verification</h2>
      
      <p>Hi there,</p>
      
      <p>Your one-time password (OTP) to verify your WhisperNet Web account is:</p>
      
      <h1 style="background: #e0f7fa; color: #000; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
        ${otp}
      </h1>

      <p><strong>This OTP is valid for the next 5 minutes.</strong> Please do not share this code with anyone.</p>

      <p>If you didn’t request this OTP, please ignore this email.</p>

      <p style="margin-top: 20px;">Thanks & Regards,<br/>WhisperNet Web Security Team</p>

      <hr style="margin: 30px 0;" />

      <small style="color: #777;">This is an automated message. Please do not reply.</small>
    </div>
  `;
 
     await resend.emails.send({
    from: "WhisperNet <noreply@kamaljoshi-ai.xyz>",
    to:email,
    subject:"Your WhipserNet verification code",
    html,
  });

   
}

module.exports= {sendOtpToEmail};
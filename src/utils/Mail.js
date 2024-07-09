import nodeMailer from 'nodemailer'

export const mail = async (userToSend, otp) =>{
    try
    {
      const transporter = nodeMailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
        
            user: `${process.env.OTP_USER_CREDENTIAL}`,
            pass: `${process.env.OTP_USER_PASS}`
        }
    });
          
          var mailOptions = {
            from: `${process.env.OTP_USER_CREDENTIAL}`,

            to: userToSend,
            subject: 'OTP Verification',
            text: `This is your email otp code: ${otp} !`
          };
          
         await transporter.sendMail(mailOptions);
        
         
    }
    catch(err)
    {
        console.log(err.message)
    }
} 


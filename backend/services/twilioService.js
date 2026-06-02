const twilio = require("twilio");

const serviceSId = process.env.TWILLO_SERVICE_SID;
const accountID = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;


if (!serviceSId || !accountID || !authToken) {
  throw new Error("Missing Twilio environment variables");
}

const client = twilio(accountID, authToken);

const sendOtpToPhoneNumber = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    const response = await client.verify.v2
      .services(serviceSId)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

const otpVerify = async (phoneNumber, otp) => {
  try {
    console.log("Verifying OTP:", otp, "for number:", phoneNumber);

    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }
    if (!otp) {
      throw new Error("OTP is required");
    }

    const response = await client.verify.v2
      .services(serviceSId)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });

    console.log("OTP verification response:", response.status);
    return response;
  } catch (error) {
    console.error("OTP verification failed:", error.message);
    throw new Error("OTP verification failed");
  }
};

module.exports = {
  otpVerify,
  sendOtpToPhoneNumber,
};

export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return {
    otp,
    otpExpiry,
  };
};

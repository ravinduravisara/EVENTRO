const { generateQRCode } = require('../../utils/qrCodeGenerator');

const generateUserQR = async (userData) => {
  const qrData = JSON.stringify({
    userId: userData._id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
  });
  return await generateQRCode(qrData);
};

module.exports = { generateUserQR };

const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data);
    return qrDataUrl;
  } catch (error) {
    throw new Error('QR Code generation failed');
  }
};

module.exports = { generateQRCode };

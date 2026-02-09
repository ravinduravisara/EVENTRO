export const parseQRData = (qrString) => {
  try {
    return JSON.parse(qrString);
  } catch {
    return null;
  }
};

export const isValidQR = (qrData) => {
  if (!qrData) return false;
  return !!(qrData.bookingId && qrData.eventId);
};

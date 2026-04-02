export const formatCardNumber = (value) =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export const formatExpiry = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const detectCardBrand = (cardNumber) => {
  const digits = String(cardNumber || '').replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^(6011|65)/.test(digits)) return 'Discover';
  return 'Bank Card';
};

export const createSavedCardRecord = ({
  bankName,
  cardholderName,
  cardNumber,
  expiryDate,
  isDefault = false,
}) => {
  const digits = String(cardNumber || '').replace(/\D/g, '');
  const [month = '', year = ''] = String(expiryDate || '').split('/');
  const normalizedYear = year.length === 2 ? 2000 + Number(year) : Number(year);

  return {
    bankName: String(bankName || '').trim(),
    cardholderName: String(cardholderName || '').trim(),
    brand: detectCardBrand(digits),
    last4: digits.slice(-4),
    expiryMonth: Number(month),
    expiryYear: normalizedYear,
    isDefault: Boolean(isDefault),
  };
};

export const getMaskedCardNumber = (card) => `**** **** **** ${card?.last4 || '----'}`;

export const getCardExpiryLabel = (card) => {
  const month = String(card?.expiryMonth || '').padStart(2, '0');
  const year = String(card?.expiryYear || '').slice(-2);
  return `${month}/${year}`;
};
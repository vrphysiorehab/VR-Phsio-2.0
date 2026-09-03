/**
 * Converts a numeric amount to words (Indian Rupee denomination style)
 * @param {number} num - The numeric amount
 * @returns {string} - The amount written in words
 */
export const numberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '';
  const value = Math.floor(num);
  if (value === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const convertLessThanOneThousand = (n) => {
    if (n < 20) return ones[n];
    const digit = n % 10;
    if (n < 100) return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 === 0 ? '' : ' and ' + convertLessThanOneThousand(n % 100));
  };

  let result = '';
  let temp = value;

  // Crore (10,00,0000)
  if (temp >= 10000000) {
    result += convertLessThanOneThousand(Math.floor(temp / 10000000)) + ' Crore ';
    temp %= 10000000;
  }
  // Lakh (1,00,000)
  if (temp >= 100000) {
    result += convertLessThanOneThousand(Math.floor(temp / 100000)) + ' Lakh ';
    temp %= 100000;
  }
  // Thousand (1,000)
  if (temp >= 1000) {
    result += convertLessThanOneThousand(Math.floor(temp / 1000)) + ' Thousand ';
    temp %= 1000;
  }
  // Rest
  if (temp > 0) {
    result += convertLessThanOneThousand(temp);
  }

  // Clean trailing spaces and formatting
  let cleanResult = result.trim().replace(/\s+/g, ' ');
  return `${cleanResult} Rupees Only`;
};

export default numberToWords;

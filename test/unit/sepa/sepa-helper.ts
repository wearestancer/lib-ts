import { randomNumber } from '#test/test-helper.js';

export const bicDataProvider = (one: boolean = false) => {
  // Thanks Wikipedia
  const data = [
    'DEUTDEFF',
    'DEUTDEFFXXX',
    'DEUTGBFFA23',
    'DEUTDEFF500',
    'UKCBUau102v',
    'UKIOLT2XXXX',
    'GBMCMRMRXXX',
    'gbtxus31xxx',
    'JUBIGB21XXX',
  ];
  if (!one) {
    return data;
  }

  return data[randomNumber(0, data.length - 1)];
};

export const ibanDataProvider = (one: boolean = false) => {
  // Thanks Wikipedia
  const data = [
    'BE71 0961 2345 6769',
    'FR76 3000 6000 0112 3456 7890 189',
    'DE91 1000 0000 0123 4567 89',
    'GR9608100010000001234567890',
    'RO09 BCYP 0000 0012 3456 7890',
    'SA4420000001234567891234',
    'ES79 2100 0813 6101 2345 6789',
    'CH56 0483 5012 3456 7800 9 ',
    'GB98 MIDL 0700 9312 3456 78',
    'GB82WEST12345698765432',
  ];

  if (!one) {
    return data;
  }

  return data[randomNumber(0, data.length - 1)];
};

export const validIbanDataProvider = (one: boolean = false) => {
  const data = [
    'AT611904300234573201',
    'BE62510007547061',
    'CH2089144321842946678',
    'DE89370400440532013000',
    'EE382200221020145685',
    'ES0700120345030000067890',
    'FI2112345600000785',
    'FR1420041010050500013M02606',
    'GB33BUKB20201555555555',
    'IE29AIBK93115212345678',
    'LT121000011101001000',
    'LU280019400644750000',
    'IT02A0301926102000000490887',
    'NL39RABO0300065264',
    'NO9386011117947',
    'PT50000201231234567890154',
    'SE3550000000054910000003',
  ];

  if (!one) {
    return data;
  }

  return data[randomNumber(0, data.length - 1)];
};

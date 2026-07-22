import { randomNumber } from '#test/test-helper.js';

export const randomCardNumbers = () => {
  // Card number found on https://www.freeformatter.com/credit-card-number-generator-validator.html
  const data = [];

  // VISA
  data.push('4532160583905253');
  data.push('4103344114503410');
  data.push('4716929813250776300');

  // MasterCard
  data.push('5312580044202748');
  data.push('2720995588028031');
  data.push('5217849688268117');

  // American Express (AMEX)
  data.push('370301138747716');
  data.push('340563568138644');
  data.push('371461161518951');

  // Discover
  data.push('6011651456571367');
  data.push('6011170656779399');
  data.push('6011693048292929421');

  // JCB
  data.push('3532433013111566');
  data.push('3544337258139297');
  data.push('3535502591342895821');

  // Diners Club - North America
  data.push('5480649643931654');
  data.push('5519243149714783');
  data.push('5509141180527803');

  // Diners Club - Carte Blanche
  data.push('30267133988393');
  data.push('30089013015810');
  data.push('30109478108973');

  // Diners Club - International
  data.push('36052879958170');
  data.push('36049904526204');
  data.push('36768208048819');

  // Maestro
  data.push('5893433915020244');
  data.push('6759761854174320');
  data.push('6759998953884124');

  // Visa Electron
  data.push('4026291468019846');
  data.push('4844059039871494');
  data.push('4913054050962393');

  // InstaPayment
  data.push('6385037148943057');
  data.push('6380659492219803');
  data.push('6381454097795863');

  // Classic one
  data.push('4111111111111111');
  data.push('4242424242424242');
  data.push('4444333322221111');

  return data;
};

export const randomCardNumber = () => {
  const data = randomCardNumbers();
  return data[randomNumber(0, data.length - 1)];
};

export const getValidCardNumber = (): string => {
  const cards = getCardBranded();
  const card = Object.values(cards).reduce((prev, curr) => prev.concat(curr));

  return card[randomNumber(0, card.length - 1)];
};

const getCardBranded = (): { visa: string[]; mastercard: string[]; national: string[] } => {
  return {
    visa: [
      '4000000400000008',
      '4000000560000004',
      '4000002080000001',
      '4000002460000001',
      '4000002760000016',
      '4000003720000005',
      '4000003800000008',
      '4000005280000002',
      '4000005780000007',
      '4000006200000007',
      '4000006430000009',
      '4000007240000007',
      '4000007520000008',
      '4000007560000009',
      '4000008260000000',
      '4242424242424242',
      '4444333322221111',
      // '4000000000003055', This card is only for card patching (see youtrack API-549)
      '4000000760000002',
      '4000001240000000',
      '4000004840000008',
    ],
    mastercard: [
      '5555555555554444',
      '5200828282828210',
      '5105105105105100',
    ],
    national: [
      '4000002500000003',
    ],
  };
};

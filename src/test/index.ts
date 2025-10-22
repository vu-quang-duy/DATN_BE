import * as CryptoJS from 'crypto-js';

const inputString = 'dung_secret_key';
const hash = CryptoJS.AES.encrypt(
  inputString,
  '42c710dc571662b4d2f6917334f06f4b02a601099a16611a0bb65d7ea76c1f09',
).toString();

console.log(hash);

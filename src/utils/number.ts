/* eslint-disable @typescript-eslint/no-var-requires */
const BigNumber = require('bignumber.js');

export class NumUtil {
  static getRandomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  // Static method for addition
  static add(a, b) {
    const num1 = new BigNumber(a);
    const num2 = new BigNumber(b);
    return num1.plus(num2).toString();
  }

  // Static method for subtraction
  static subtract(a, b) {
    const num1 = new BigNumber(a);
    const num2 = new BigNumber(b);
    return num1.minus(num2).toString();
  }

  // Static method for multiplication
  static multiply(a, b) {
    const num1 = new BigNumber(a);
    const num2 = new BigNumber(b);
    return num1.times(num2).toString();
  }

  // Static method for division
  static divide(a, b) {
    const num1 = new BigNumber(a);
    const num2 = new BigNumber(b);
    return num1.dividedBy(num2).toString();
  }

  static getValComposition(total, composition) {
    const percent = NumUtil.divide(composition, 100);
    return NumUtil.multiply(percent, total);
  }
}

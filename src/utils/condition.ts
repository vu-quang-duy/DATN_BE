export class CondUtil {
  static diffAndVail = (bodyVal, objVal) => {
    return !!bodyVal && bodyVal !== objVal;
  };

  static setIfExists = (target, key, value) => {
    if (value != undefined && target[key] !== value) {
      target[key] = value;
    }
  };

  static saveIfChanged = (objVal, bodyVal, key: string[]) => {
    key.forEach((k) => {
      this.setIfExists(objVal, k, bodyVal[k]);
    });
  };
}

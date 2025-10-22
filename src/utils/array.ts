export class ArrUtil {
  static getOldListDifferent = (keys: string[], body: any, obj: any): Array<any> => {
    const result = [];
    keys.forEach((key) => {
      if (obj[key] && body[key] != undefined && body[key] != obj[key]) {
        result.push(obj[key]);
      }
    });
    return result;
  };

  static getOldPathEntityFromBody = ({ entity, body, uploadKeys }) => {
    return this.getOldListDifferent(uploadKeys, body, entity).map((path) => ({ path }));
  };

  static getPathsFromBody = ({ body, uploadKeys }) => {
    const paths = uploadKeys.map((key) => body[key]);
    return paths.filter((value) => !!value).map((value) => ({ path: value }));
  };

  static getRandomSubItems = (arr, num) => {
    const shuffled = arr.slice(); // Make a copy of the array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, num);
  };
}

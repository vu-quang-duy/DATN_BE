export class HelperUtils {
  static existByName = async (entity: any, name: string, field = 'name') => {
    return await entity.existsBy({ [field]: name });
  };

  static generateRandomClassCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let classCode = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      classCode += characters[randomIndex];
    }

    return classCode;
  }
}

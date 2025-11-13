/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ENV } from 'src/config/environment';
import { JWTPayload } from 'src/dto/common-request.dto';
const CryptoJS = require('crypto-js');

export class HashUtil {
  // static hashBcrypt = async (text = '', salt = 10) => {
  //   // generate salt to hash password
  //   const saltHash = await bcrypt.genSalt(salt);
  //   // now we set user password to hashed password
  //   return await bcrypt.hash(text, saltHash);
  // };

  // static compareBcrypt = async (plaintext, hash): Promise<boolean> => {
  //   return await bcrypt.compare(plaintext, hash);
  // };
  static comparePassword = async (plaintext: string, stored: string): Promise<boolean> => {
    return plaintext === stored;
  };

  static signAccessToken = async (sub: string, jwtService: JwtService) => {
    const payload: JWTPayload = { sub };

    const token = await jwtService.signAsync(payload, {
      secret: ENV.JWT.JWT_SECRET,
      expiresIn: ENV.JWT.JWT_EXPIRE_IN,
    });

    return {
      payload,
      access_token: token,
      expiresIn: ENV.JWT.JWT_EXPIRE_IN,
    };
  };

  // static aesEncrypt = (plainText: string) => {
  //   return CryptoJS.AES.encrypt(plainText, ENV.API_KEY).toString();
  // };

  // static aesDecrypt = (encrypted: string) => {
  //   return CryptoJS.AES.decrypt(encrypted, ENV.API_KEY).toString(CryptoJS.enc.Utf8);
  // };

  // static comparePassword = async (plaintext, hash): Promise<boolean> => {
  //   const oldPassword = await HashUtil.aesDecrypt(hash);
  //   return oldPassword === plaintext;
  // };
}

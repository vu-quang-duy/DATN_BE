import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'Gmail',
      auth: {
        user: 'ad.system.ldh.38@gmail.com',
        pass: 'crbhaclpagxxtocr',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Sign School System" <ad.system.ldh.38@gmail.com>',
      to,
      subject,
      text,
    });
  }
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ENV } from 'src/config/environment';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKey: string;

  constructor() {
    this.validApiKey = ENV.API_KEY;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key']; // Lấy API key từ header
    // Kiểm tra API key có hợp lệ hay không
    if (apiKey && apiKey === this.validApiKey) {
      return true; // Nếu API key hợp lệ, cho phép tiếp tục
    } else {
      throw new UnauthorizedException('Invalid API Key');
    }
  }
}

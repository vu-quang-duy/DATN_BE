import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './access-token.strategy';
import { ENV } from 'src/config/environment';

// Process is: Strategy -> guard
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: ENV.JWT.JWT_SECRET,
      signOptions: {
        expiresIn: ENV.JWT.JWT_EXPIRE_IN,
      },
    }),
  ],
  providers: [JwtStrategy],
})
export class AuthModule {}

// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';
import { RefreshToken } from './model/refresh-token.model';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get('auth.jwt.secret');
        if (!secret) {
          throw new Error(
            'JWT secret is not configured. Check your .env file and auth.config.ts',
          );
        }
        return {
          secret: secret,
          signOptions: {
            expiresIn: configService.get('auth.jwt.accessTokenExpiry'),
          },
        };
      },
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([RefreshToken]),
    UsersModule,
  ],
  providers: [
    AuthService,
    JwtTokenService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtTokenService],
})
export class AuthModule {}

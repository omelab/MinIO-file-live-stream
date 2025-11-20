// auth/jwt-token.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: TokenPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt.secret'),
        expiresIn: this.configService.get('auth.jwt.accessTokenExpiry'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt.secret'),
        expiresIn: this.configService.get('auth.jwt.refreshTokenExpiry'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.configService.get('auth.jwt.secret'),
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.configService.get('auth.jwt.secret'),
    });
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, ...cleanPayload } = payload;
    return this.generateTokens(cleanPayload);
  }
}

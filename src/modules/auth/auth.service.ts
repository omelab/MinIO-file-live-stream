// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../users/model/user.model';
import { UsersService } from '../users/users.service';
import { JwtTokenService, TokenPayload, Tokens } from './jwt-token.service';
import { RefreshToken } from './model/refresh-token.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    @InjectModel(RefreshToken)
    private readonly refreshTokenModel: typeof RefreshToken,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<{ user: User; tokens: Tokens }> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.jwtTokenService.generateTokens(payload);

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user: user.toJSON() as User,
      tokens,
    };
  }

  async register(createUserDto: any): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.usersService.create(createUserDto);

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.jwtTokenService.generateTokens(payload);

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: user.toJSON() as User,
      tokens,
    };
  }

  async logout(userId: number, refreshToken: string): Promise<void> {
    // Revoke the specific refresh token
    await this.refreshTokenModel.update(
      { isRevoked: true },
      {
        where: {
          userId,
          token: refreshToken,
        },
      },
    );

    // Optional: Revoke all user's refresh tokens
    // await this.refreshTokenModel.update(
    //   { isRevoked: true },
    //   { where: { userId } },
    // );
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ user: User; tokens: Tokens }> {
    // Verify the refresh token
    const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken);

    // Check if token exists in database and is not revoked
    const storedToken = await this.refreshTokenModel.findOne({
      where: {
        userId: payload.sub,
        token: refreshToken,
        isRevoked: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [User],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.jwtTokenService.refreshTokens(refreshToken);

    // Revoke old token and save new one
    await this.refreshTokenModel.update(
      { isRevoked: true },
      { where: { id: storedToken.id } },
    );

    await this.saveRefreshToken(payload.sub, tokens.refreshToken);

    return {
      user: storedToken.user.toJSON() as User,
      tokens,
    };
  }

  async validateRefreshToken(refreshToken: string): Promise<User | null> {
    try {
      const payload =
        await this.jwtTokenService.verifyRefreshToken(refreshToken);

      const storedToken = await this.refreshTokenModel.findOne({
        where: {
          userId: payload.sub,
          token: refreshToken,
          isRevoked: false,
          expiresAt: { [Op.gt]: new Date() },
        },
        include: [User],
      });

      return storedToken ? storedToken.user : null;
    } catch (_error) {
      return null;
    }
  }

  private async saveRefreshToken(userId: number, token: string): Promise<void> {
    const payload = await this.jwtTokenService.verifyRefreshToken(token);

    const tokenData: Partial<RefreshToken> = {
      userId,
      token,
      expiresAt: new Date(payload.exp ?? 1 * 1000),
      isRevoked: false,
    };

    await this.refreshTokenModel.create(tokenData as any);
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenModel.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });
  }
}

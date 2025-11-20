import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  const config = {
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-key-for-debugging',
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    },
  };
  return config;
});

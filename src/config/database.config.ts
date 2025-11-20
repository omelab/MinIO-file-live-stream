// config/database.config.ts
import { registerAs } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

const getLoggingConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  switch (nodeEnv) {
    case 'development':
      return console.log;
    case 'test':
      return false;
    case 'production':
      return (sql: string) => {
        console.log(`[SQL] ${sql}`);
      };
    default:
      return false;
  }
};

export default registerAs(
  'database',
  (): SequelizeModuleOptions => ({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'nestjs_db',
    autoLoadModels: true,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: getLoggingConfig(),
    dialectOptions: {
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }),
);

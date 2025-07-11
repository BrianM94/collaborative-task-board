import dotenv from 'dotenv';

dotenv.config();

export const config = {
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER:process.env.DB_USER,
    DB_PASS:process.env.DB_PASS,
    DB_PORT:process.env.DB_PORT,
    DB_DIALECT:process.env.DB_DIALECT,
};

if (!config.JWT_SECRET) {
  throw new Error('JWT_SECRET es requerido en las variables de entorno');
}
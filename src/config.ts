import { configDotenv } from 'dotenv';

configDotenv();

const getEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`CRITICAL ERROR: Missing environment variable: ${key}`);
    }
    return value;
};

export const config = {
    PORT: process.env.PORT || '3000',
    MONGO_URI: getEnvVar('MONGO_URI'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    GOOGLE_APP: {
        USER: getEnvVar('GOOGLE_APP_USER'),
        PASSWORD: getEnvVar('GOOGLE_APP_PASSWORD'),
    },
};

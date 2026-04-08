"use strict";
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.GOOGLE_APP_USER = process.env.GOOGLE_APP_USER || 'test@example.com';
process.env.GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD || 'test-password';

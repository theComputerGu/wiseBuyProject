// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// ⬇️ הוספות חדשות
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS כפי שהיה
  app.enableCors({ origin: true, credentials: true });

  // ⬅️ חדש: הגשה סטטית של תיקיית uploads
  // כל פנייה ל- /uploads/... תגיש קובץ מתוך התיקייה ../uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // ValidationPipe כפי שהיה
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  const url = await app.getUrl();
  console.log(`API running on ${url}`);
  console.log(`Serving uploads from: ${url}/uploads`);
}
bootstrap();

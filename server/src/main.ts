import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');          // ← חשוב: מאזין בוודאות
  const url = await app.getUrl();             // ← ידפיס את ה-URL בפועל
  console.log(`API running on ${url}`);
}
bootstrap();

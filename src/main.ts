import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

import { ValidationPipe } from '@nestjs/common';

import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

import session from 'express-session';
import "dotenv/config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,

      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

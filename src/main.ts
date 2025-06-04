import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENV } from './config/environment';
import { initAPIDocs } from './config/swagger';
import { AppErrorHandler } from './middleware/app-error-handler';
// import { join } from 'path';
import * as express from 'express';


const globalPrefix = 'api';
const swaggerEndpoint = 'api-docs';

async function bootstrap() {
  const logger = new Logger('main');

  const app = await NestFactory.create(AppModule);
  app.use('/videos', express.static('/home/tuyentrinh/Desktop/sign_school/uploads/videos'));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AppErrorHandler(app.get(HttpAdapterHost).httpAdapter));

  const allowedOrigins = [
  'http://202.191.100.3:3000',
  'http://localhost:3000',
];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: '*',
  credentials: true,
  allowedHeaders: 'Content-Type, Accept, Authorization, Cache-Control',
});
  

  initAPIDocs({
    app,
    endpoint: swaggerEndpoint,
  });

  const port = ENV.PORT;

  await app.listen(port);
// chinh lai khi dung deploy
  logger.verbose(`====== App url: http://202.191.56.11:8088/${globalPrefix}`);
  logger.verbose(`====== Swagger url: http://202.191.56.11:8088/${swaggerEndpoint}`);
  // logger.verbose(`====== App url: http://localhost:8088/${globalPrefix}`);
  // logger.verbose(`====== Swagger url: http://localhost:8088/${swaggerEndpoint}`);
}

bootstrap();

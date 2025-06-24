import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENV } from './config/environment';
import { initAPIDocs } from './config/swagger';
import { AppErrorHandler } from './middleware/app-error-handler';
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

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      console.log('🔥 OPTIONS REQUEST RECEIVED');
      console.log('Origin:', req.headers.origin);
      console.log('Method:', req.headers['access-control-request-method']);
      console.log('Headers:', req.headers['access-control-request-headers']);
      console.log('Full headers:', req.headers);
    }
    next();
  });

  const allowedOrigins = [
    'http://localhost:3000',
    'http://202.191.100.3:3000',
    'http://202.191.56.11:3000',
    'http://127.0.0.1:3000',
    'http://172.24.0.1:3000',
    'https://wesign.ibme.edu.vn'
  ];

app.enableCors({
    origin: (origin, callback) => {
      console.log('🔍 CORS Origin Check:', origin);
      console.log('🔍 Allowed Origins:', allowedOrigins);
      
      if (!origin || allowedOrigins.includes(origin)) {
        console.log('✅ Origin ALLOWED', origin);
        callback(null, true);
      } else {
        console.log('❌ Origin REJECTED', origin);
        callback(new Error(`CORS not allowed for origin: ${origin}`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Accept', 
      'Authorization',
      'Cache-Control',
      'X-Requested-With',
      'Origin',
      'authorization' // lowercase version too
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200
  });

  // Add response logging middleware AFTER CORS
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      console.log('🔥 OPTIONS RESPONSE HEADERS:');
      console.log('Access-Control-Allow-Origin:', res.getHeader('Access-Control-Allow-Origin'));
      console.log('Access-Control-Allow-Methods:', res.getHeader('Access-Control-Allow-Methods'));
      console.log('Access-Control-Allow-Headers:', res.getHeader('Access-Control-Allow-Headers'));
      console.log('Access-Control-Allow-Credentials:', res.getHeader('Access-Control-Allow-Credentials'));
      res.sendStatus(200);
    } else {
    next();
    }
  });


  // REMOVED the manual OPTIONS handler - let NestJS handle it

  initAPIDocs({
    app,
    endpoint: swaggerEndpoint,
  });

  const port = ENV.PORT;

  await app.listen(port, '0.0.0.0');
  
  logger.verbose(`====== App url: http://202.191.56.11:8088/${globalPrefix}`);
  logger.verbose(`====== Swagger url: http://202.191.56.11:8088/${swaggerEndpoint}`);
  // logger.verbose(`====== App url: http://localhost:8088/${globalPrefix}`);
  // logger.verbose(`====== Swagger url: http://localhost:8088/${swaggerEndpoint}`);
}

bootstrap();
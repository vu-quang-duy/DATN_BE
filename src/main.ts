import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENV } from './config/environment';
import { initAPIDocs } from './config/swagger';
import { AppErrorHandler } from './middleware/app-error-handler';
// import * as compression from 'compression';
// import * as cookieParser from 'cookie-parser';
// import helmet from 'helmet';

const globalPrefix = 'api';
const swaggerEndpoint = 'api-docs';

async function bootstrap() {
  const logger = new Logger('main');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AppErrorHandler(app.get(HttpAdapterHost).httpAdapter));

  app.enableCors({
    origin: '*',
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

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const customCss = `.opblock-summary-operation-id {white-space: nowrap}`;

export const initAPIDocs = ({ app, endpoint }: { app; endpoint: string }): void => {
  const title = 'Bluequant API APIs document';
  const config = new DocumentBuilder()
    .addBearerAuth()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key', // Header name where the API key will be passed
        in: 'header', // The API key will be passed in the request header
      },
      'api-key', // Name of the security scheme
    )
    .setTitle(title)
    .setVersion('3.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(endpoint, app, document, {
    customSiteTitle: 'Bluequant API APIs',
    customCss,
    swaggerOptions: { displayOperationId: true, displayRequestDuration: true, persistAuthorization: true },
  });
};

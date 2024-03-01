import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import dotenv from 'dotenv';
import { AllExceptionsFilter } from './global-filters/exceptions-filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Schrodinger Cat Image generator - Dalle3 API')
    .setDescription('The description of the API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new AllExceptionsFilter()); // use the filter globally

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

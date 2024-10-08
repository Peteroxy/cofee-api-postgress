import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { ApiKeyGuard } from './common/guards/api-key/api-key.guard';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response/wrap-response.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout/timeout.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform:true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }))
  // app.useGlobalGuards(new ApiKeyGuard());
  app.useGlobalInterceptors(new WrapResponseInterceptor(), new TimeoutInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const options = new DocumentBuilder()
    .setTitle('coffee')
    .setDescription('coffee application')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3900);
}
bootstrap();

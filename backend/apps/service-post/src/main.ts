import { NestFactory } from '@nestjs/core';
import { ServicePostModule } from './service-post.module';

async function bootstrap() {
  const app = await NestFactory.create(ServicePostModule);
  await app.listen(3000);
}
bootstrap();

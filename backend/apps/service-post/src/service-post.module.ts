import { Module } from '@nestjs/common';
import { ServicePostController } from './service-post.controller';
import { ServicePostService } from './service-post.service';

@Module({
  imports: [],
  controllers: [ServicePostController],
  providers: [ServicePostService],
})
export class ServicePostModule {}

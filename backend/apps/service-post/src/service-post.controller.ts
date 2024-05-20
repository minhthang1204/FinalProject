import { Controller, Get } from '@nestjs/common';
import { ServicePostService } from './service-post.service';

@Controller()
export class ServicePostController {
  constructor(private readonly servicePostService: ServicePostService) {}

  @Get()
  getHello(): string {
    return this.servicePostService.getHello();
  }
}

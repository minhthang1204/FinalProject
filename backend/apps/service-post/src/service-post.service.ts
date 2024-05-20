import { Injectable } from '@nestjs/common';

@Injectable()
export class ServicePostService {
  getHello(): string {
    return 'Hello World!';
  }
}

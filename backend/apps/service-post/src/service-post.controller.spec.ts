import { Test, TestingModule } from '@nestjs/testing';
import { ServicePostController } from './service-post.controller';
import { ServicePostService } from './service-post.service';

describe('ServicePostController', () => {
  let servicePostController: ServicePostController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ServicePostController],
      providers: [ServicePostService],
    }).compile();

    servicePostController = app.get<ServicePostController>(ServicePostController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(servicePostController.getHello()).toBe('Hello World!');
    });
  });
});

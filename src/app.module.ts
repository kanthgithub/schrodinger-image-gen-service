import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageGenerationModule } from './image-generation/image-generation.module';

@Module({
  imports: [ImageGenerationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

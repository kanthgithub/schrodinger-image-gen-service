// image-generation.module.ts
import { Module } from '@nestjs/common';
import { ImageGenerationService } from './image-generation.service';
import { ImageGenerationController } from './image-generation.controller';
import { PromptGenerationController } from './prompt-generation.controller';

@Module({
  controllers: [ImageGenerationController, PromptGenerationController],
  providers: [ImageGenerationService],
})
export class ImageGenerationModule {}
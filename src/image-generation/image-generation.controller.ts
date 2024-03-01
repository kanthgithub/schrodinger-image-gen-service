// image-generation.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ImageGenerationService } from './image-generation.service';
import { ImageGenerationRequest, ImageGenerationResponse, ImageQueryResponse } from './types/types';

@Controller('image-generation')
export class ImageGenerationController {
  constructor(private readonly imageGenerationService: ImageGenerationService) {}

  @Post('/generate')
  generateImage(@Body() request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return this.imageGenerationService.generateImage(request);
  }

  @Get('/get-image')
  getImage(@Query('requestId') requestId: string): Promise<ImageQueryResponse> {
    return this.imageGenerationService.getImage(requestId);
  }
}
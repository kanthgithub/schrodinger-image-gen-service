import { Injectable } from '@nestjs/common';
import { generateFinalPromptFromSentences, runDalle } from './openai/craft-image';
import { ImageGenerationRequest, ImageGenerationResponse, ImageQueryResponse, Trait, basePrompt, generateSentences, getTraitDefinitions } from './types/types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';

@Injectable()
export class ImageGenerationService {
  private imageMap = new Map<string, Promise<string>>();

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // Get the trait definitions
    const traitDefinitions = getTraitDefinitions();

    // Extract the traits from the image description and the new trait
    const traits = [...request.imageDescription.traits];
    if (request.newTrait) {
      traits.push(request.newTrait);
    }

    // Generate sentences from the traits
    const sentences = await generateSentences({ traits }, traitDefinitions);

    // Generate the final prompt
    const finalPrompt = await generateFinalPromptFromSentences(basePrompt, sentences);

    console.log(`finalPrompt is: ${finalPrompt}`);

    // Generate the image data
    const imageDataPromise = runDalle(finalPrompt);

    const requestId = uuidv4();

    // Store the image data promise in the map

    this.imageMap.set(requestId, imageDataPromise.then(imageData => imageData.data[0].url));

    const response = new ImageGenerationResponse();
    response.requestId = requestId;
    response.status = 'success';

    return response;
  }

  async getImageData(url: string, requestId: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(`./${requestId}.png`, response.data);
    return Buffer.from(response.data, 'binary').toString('base64');
  }

  async getImage(requestId: string): Promise<ImageQueryResponse> {
    const imageUrl = await this.imageMap.get(requestId);
    if (!imageUrl) {
      throw new Error('Request not found');
    }

    const base64Image = await this.getImageData(imageUrl, requestId);

    return {
      requestId,
      image: base64Image,
      status: 'completed',
      message: 'Image generation completed successfully'
    };
  }
}
import { Injectable } from '@nestjs/common';
import { generateFinalPromptFromSentences, runDalle } from './openai/craft-image';
import { ImageGenerationRequest, ImageGenerationResponse, ImageQueryResponse, Trait, basePrompt, generateSentences, getTraitDefinitions } from './types/types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';
import streamToArray from 'stream-to-array';
const fetch = require('node-fetch');

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

    let sentences = await generateSentences({ traits }, traitDefinitions);

    console.log(`sentences derived from traits are: ${sentences}`);

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
    const imageUrlPromise = this.imageMap.get(requestId);
    if (!imageUrlPromise) {
      throw new Error(`No image found for request ID: ${requestId}`);
    }

    const imageUrl = await imageUrlPromise;

    // Fetch the image from the URL
    const response = await fetch(imageUrl);

    // Convert the data stream to a Buffer
    const array = await streamToArray(response.body);
    const buffer = Buffer.concat(array);

    // Convert the Buffer to a base64 string
    const base64Image = buffer.toString('base64');

    // Create a data URL
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return {
      requestId,
      images: [dataUrl],
      status: 'completed',
      message: 'Image generation completed successfully'
    };
  }
}
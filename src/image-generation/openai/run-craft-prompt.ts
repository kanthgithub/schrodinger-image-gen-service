import fs from 'fs';
import path from 'path';
import { generateFinalPromptFromSentences, runVision } from './craft-image';

async function processImage() {

    // Call runVision with the base64 image
    const result = await generateFinalPromptFromSentences("Pixelated Art of a Cat", ["This is a picture of a cat."]);

    return result;
}

// npx ts-node src/image-generation/openai/run-craft-image.ts
// Call processImage when the script is run
processImage().then(result => {
    const description = result.choices[0].message.content;
    console.log(description);

}).catch(error => {
    console.error(error);
});
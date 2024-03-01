import axios from 'axios';
import fs from 'fs';
import gm from 'gm';
import { promisify } from 'util';
import dotenv from "dotenv";
dotenv.config();

function encodeImage(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
}

export const runDalle = async (prompt: string) => {
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
        model: 'dall-e-3',
        prompt: prompt,
        quality: 'standard',
        n: 1,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    console.log(`response.data from dalle: ${JSON.stringify(response.data)}`);

    return response.data;
}

export const runVision = async (base64Image: string) => {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4-vision-preview',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Describe the image' },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/webp;base64,${base64Image}`,
                            detail: 'low'
                        },
                    },
                ],
            }
        ],
        max_tokens: 300,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data;
}

export const generateFinalPrompt = async (inputprompt: string) => {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4-0125-preview',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: `Create a Dall-E 3 prompt for me with the following requirements. ${inputprompt}` },
                ],
            }
        ],
        max_tokens: 300,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data;
}

// { type: 'text', text: `Create a Dall-E 3 prompt for me with the following requirements. ${basePrompt}` },
// { type: 'text', text: sentenceText }


export const generateFinalPromptFromSentences = async (basePrompt: string, sentences: string[]) => {
    // Combine the sentences into a single string
    let sentenceText = basePrompt+ "\n"+sentences.join('\n');
    console.log(`sentenceText: ${sentenceText}`);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4-0125-preview',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: sentenceText }
                ],
            }
        ],
        max_tokens: 300,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    const result = response.data;

    //console.log(`response.data: ${JSON.stringify(response.data)}`);

    const description = result.choices[0].message.content;

    return description;
}

export const craftPrompt = async (desc: string, variation: string) => {
    const content = [
        'I have an image described as follows.',
        `"${desc}"`,
        'I want to create a variation of the pixel art image of 64x64 pixel grid.',
        'And try to maintain the original image as much as possible.',
        "Don't change the posture of the character.",
        variation,
        'Please create a prompt for this variation to be used in DALL-E 3?'
    ];

    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        model: 'gpt-4-0125-preview',
        prompt: content.join(' '),
        max_tokens: 2000
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    const responsePrompt = response.data;
    const prompt = responsePrompt.choices[0].text.trim();
    return { prompt, id: responsePrompt.id };
}

async function downloadImage(imageUrl: string) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return response.data;
}

async function createVariation(base64Image: string, variation: string) {
    // derive prompt from image
    const visionResult = await runVision(base64Image);
    const description = visionResult.choices[0].message.content;

    // craft a prompt for the variation
    const craftPromptResult = await craftPrompt(description, variation);
    const prompt = craftPromptResult.prompt;

    // run dalle with the prompt
    const dalleResult = await runDalle(prompt);

    // download the image
    const url = dalleResult.data[0].url;
    const imageBin = await downloadImage(url);
    return {
        vision: visionResult,
        craftPrompt: craftPromptResult,
        dalle: dalleResult,
        image: imageBin.toString('base64')
    };
}

async function reduceSize(imageBin: Buffer, ratio: number) {
    const image = gm(imageBin);
    const size = promisify(image.size.bind(image));
    const toBuffer = promisify(image.toBuffer.bind(image));
    const { width, height } = await size();
    const reducedImage = await image.resize(Math.floor(width / ratio), Math.floor(height / ratio)).toBuffer();
    return reducedImage;
}

async function enlargeSize(imageBin: Buffer, ratio: number) {
    const image = gm(imageBin);
    const size = promisify(image.size.bind(image));
    const toBuffer = promisify(image.toBuffer.bind(image));
    const { width, height } = await size();
    const enlargedImage = await image.resize(width * ratio, height * ratio).toBuffer();
    return enlargedImage;
}

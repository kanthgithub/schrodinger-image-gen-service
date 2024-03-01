import { IsString, IsArray, IsObject, ValidateNested, IsNotEmpty, IsBase64, validate } from 'class-validator';
import { Type } from 'class-transformer';
import fs from 'fs';
import { ApiProperty } from '@nestjs/swagger';

export class Trait {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}

export class ImageDescription
{
    /// <summary>
    /// The traits that the image has
    /// </summary>
    traits: Trait[];

    /// Image in base64 format
    images: string;
}

export class ImageGenerationRequest {
    @IsString()
    @IsNotEmpty()
    imageDescription: ImageDescription;

    @IsObject()
    @ValidateNested()
    @Type(() => Trait)
    newTrait: Trait;
}

export class ImageGenerationResponse {
    @IsString()
    @IsNotEmpty()
    requestId: string;

    @IsString()
    status: string;

    @IsString()
    message: string;
}

export class ImageQueryResponse {
    @IsString()
    @IsNotEmpty()
    requestId: string;

    @IsString()
    @IsBase64()
    images: string[];

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}

export class TraitValue {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsString({ each: true })
    values: string[];

    @IsString()
    @IsNotEmpty()
    variation: string;
}

export class TraitDefinition {
    [key: string]: TraitValue;
}

export const generateSentences = async (request: { traits: Trait[] }, traitDefinitions: Map<string, TraitValue>): Promise<string[]> => {
    let sentences: string[] = [];
    for (let trait of request.traits) {
        const traitName = trait.name;
        let traitDef = traitDefinitions.get(traitName);
        if (traitDef) {
            // Create a new TraitValue object with the trait's value
            let traitValue = new TraitValue();
            traitValue.name = trait.name;
            traitValue.values = [trait.value];
            traitValue.variation = traitDef.variation;

            // Validate the TraitValue object
            let errors = await validate(traitValue);
            if (errors.length > 0) {
                throw new Error(`Validation failed during Generate Sentences for trait: ${JSON.stringify(traitValue)}`);
            }

            if (traitDef.values.includes(trait.value)) {
                sentences.push(traitDef.variation.replace('%s', trait.value));
            } else {
                throw new Error(`Trait value \`${trait.value}\` is not found under TraitName: \`${traitName}\` in trait definitions -> valid TraitValues are: ${traitDef.values}`);
            }
        } else {
            throw new Error(`Trait ${traitName} not found in trait definitions`);
        }
    }

    console.log(`sentences derived from traits are: ${sentences}`);

    if(!sentences || sentences.length === 0) {
        throw new Error('Dalle3 - No sentences were generated from traits');
    }


    return sentences;
}

export const basePrompt = "Rephrase the following to create a logical sentence: ";

export function getTraitDefinitions(): Map<string, TraitValue> {
    // Read the JSON file and parse it into an array of TraitValue
    let traitArray: TraitValue[] = JSON.parse(fs.readFileSync('traits.json', 'utf-8'));

    // Convert the array into a Map
    let traitDefinitions = new Map<string, TraitValue>();
    for (let traitValue of traitArray) {
        traitDefinitions.set(traitValue.name, traitValue);
    }

    return traitDefinitions;
}
# Schrodinger Cat - AI Image Generation 

## Environment

1. Ensure your node environment is v18.17.0 or above
2. copy .env.example in root directory to .env
3. set your openApiKey in the .env

## Build

```sh
yarn install
```

## Run

```sh
yarn start:dev
```

## EndPoints

1. Generate Image from traits

```sh
http://localhost:3000/image-generation/generatecurl --location 'http://localhost:3000/image-generation/generate' \
--header 'Content-Type: application/json' \
--data '{
  "imageDescription": {
    "traits": [
        {
            "name": "hat",
            "value": "skull cap"
        },
        {
            "name": "eye",
            "value": "is wearing blind glasses"
        }
    ]
  },
    "newTrait": {
        "name": "mouth",
        "value": "alluring"
    }
}'
```

Sample Response:

```json
{
    "requestId": "5e897a62-533d-4bfe-8619-7e46221614e3",
    "status": "success"
}
```

2. Get Image from requestId

```sh
curl --location 'http://localhost:3000/image-generation/get-image?requestId=5e897a62-533d-4bfe-8619-7e46221614e3'
```

Sample response for Get Image

```json

{
    "requestId": "5e897a62-533d-4bfe-8619-7e46221614e3",
    "image": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAA552NhQlgAADnnanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAOcFqdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3Vybjp1dWlkOjA5YWE4M2VjLTc5NzQtNDBlMC1iNmJhLTY0Mzc3MjcyMTFhNgAAAAGhanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAAxWp1bWIAAAAmanVtZGNib3IAEQAQgAAAqgA4m3EDYzJwYS5hY3Rpb25zAAAAAJdjYm9yoWdhY3Rpb25zgaNmYWN0aW9ubGMycGEuY3JlYXRlZG1zb2Z0d2FyZUFnZW5....",
    "status": "completed",
    "message": "Image generation completed successfully"
}
```
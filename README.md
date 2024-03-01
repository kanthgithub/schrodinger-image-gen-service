# Schrodinger Cat - AI Image Generation 

## Environment

1. Ensure your node environment is v18.17.0 or above
2. copy .env.example in root directory to .env
3. set your openApiKey in the .env
4. Default port will in .env will be 3010 and in case if you delete it, application will default to run on 3000

## Build

```sh
yarn install
```

## Run Local

```sh
yarn start:dev
```

## Docker Build

- To build the Docker image, you can use the following command:

```sh
docker build -t schrodinger-image-gen-service .
```

## Docker Image Run


- To run the Docker container, you can use the following command:


```sh
docker run --env-file .env -p 3010:3010 schrodinger-image-gen-service
```

## Swagger URL

http://localhost:3010/api

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
    "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAA552NhQlgAADnnanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAOcFqdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3Vybjp1dWlkOjY4YzAyM2E0LThlNWQtNDg4ZS05NGFkLWI1Mzg5NTM0MDg5MgAAAAGhanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAAxWp1bWIAAAAmanVtZGNib3IAEQAQgAAAqgA4m3EDYzJwYS5hY3Rpb2...."],
    "status": "completed",
    "message": "Image generation completed successfully"
}
```


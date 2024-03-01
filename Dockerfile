# Dockerfile
FROM --platform=linux/amd64 node:18.17.0

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install the project dependencies
RUN yarn install

# Copy the rest of the project files to the working directory
COPY . .

# Build the app
RUN yarn build

# Expose port 3010 for the app
EXPOSE 3010

# Define the command to run the app
CMD ["yarn", "start:dev"]
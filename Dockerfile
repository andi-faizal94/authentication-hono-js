Copy
# Use a base image that supports Node.js
FROM node:18-alpine

# Install necessary packages: curl and bash
RUN apk add --no-cache curl bash

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to the PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Set the working directory
WORKDIR /app

# Copy the package.json and bun.lockb files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the application source code
COPY src ./src

# Build the application
RUN bun build src/index.ts --compile --outfile server

# Expose the application port (set the appropriate port)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]
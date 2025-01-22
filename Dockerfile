# Use a base image that supports Node.js
FROM node:18-buster

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to the PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb files to the working directory
COPY package.json bun.lockb ./

# Copy the Prisma schema
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Generate the Prisma Client
RUN bun run prisma generate

# Copy the application source code
COPY src ./src

# Build the application
RUN bun build src/index.ts --compile --outfile server

# Expose the application port (set the appropriate port)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]
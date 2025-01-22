FROM node:18-alpine

# Install Bun
RUN bun install

# List installed modules to debug
RUN ls -la /app/node_modules

# Copy the application source code
COPY src ./src

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
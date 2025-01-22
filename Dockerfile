# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy rest of the files
COPY . ./

# Build the binary
RUN bun build src/index.ts --compile --outfile server

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /app/server ./server

# Run the binary
CMD ["./server"]
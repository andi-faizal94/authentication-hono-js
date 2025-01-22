FROM node:18

# Install libstdc++
RUN apt-get update && apt-get install -y libstdc++6

WORKDIR /app
COPY . .
RUN npm install

CMD ["node", "src/index.js"]
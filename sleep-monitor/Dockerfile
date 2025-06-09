# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build Next.js for production
RUN NEXT_DISABLE_ESLINT=1 npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

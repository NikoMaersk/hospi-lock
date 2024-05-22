# Use the official Node.js image as a base
FROM node:18

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
# Install TypeScript globally

RUN npm install -g typescript

# Copy the rest of the application code
COPY . .

# Compile TypeScript files
RUN npm run build

# Change to the dist directory
WORKDIR /usr/src/app/dist

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]

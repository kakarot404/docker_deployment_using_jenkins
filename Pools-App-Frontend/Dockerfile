# Use Node.js official image as a base for Angular
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy all the frontend files to the container
COPY . .

# Expose the frontend port (default: 4200)
EXPOSE 4200

# Start the frontend application (Angular)
CMD ["npm", "start"]

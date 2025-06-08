# Use Node.js official image as a base
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install backend dependencies
RUN npm install

RUN npm install -g nodemon

# Copy all the application files to the container
COPY . .

# Expose the backend port (default: 1234)
EXPOSE 1234

# Start the backend server
CMD ["npm", "start"]
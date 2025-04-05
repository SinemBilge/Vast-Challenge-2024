# Dockerfile for React app

# Use an official node runtime as a parent image
FROM node:14 as build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

RUN npm install @mui/material @emotion/react @emotion/styled

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build
EXPOSE 3000
# Serve the built application using serve
RUN npm install -g serve
CMD ["serve", "-s", "build"]

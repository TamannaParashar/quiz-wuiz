# Stage 1: Build the frontend React application
FROM node:20 AS builder
WORKDIR /app

# Accept Clerk publishable key as a build-time argument
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application and install code execution runtimes
FROM node:20-slim
WORKDIR /app

# Install system dependencies for user code compilation/execution (Python, C/C++, Java)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    build-essential \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Create a symlink so that the "python" command points to "python3"
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy backend files
COPY index.js db.js config.js ./
COPY models ./models

# Set runtime environment defaults
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Run the backend server
CMD ["npm", "start"]

# =============================================================
# Backend Dockerfile — Node.js / Express
# =============================================================
# What happens here, step by step:
#
#  1. Start FROM the official Node 20 image (alpine = ~5MB base, no bloat)
#  2. Set /app as the working directory inside the container
#  3. Copy package files FIRST (Docker caches this layer — if package.json
#     hasn't changed, the expensive "npm ci" step is skipped on rebuilds)
#  4. Install ONLY production dependencies (no devDependencies like nodemon)
#  5. Copy the rest of the source code
#  6. Create the uploads folder (multer needs it to exist)
#  7. Tell Docker this container listens on port 5000
#  8. Add a HEALTHCHECK so docker-compose knows when we're truly ready
#     (the frontend container won't start until this passes)
#  9. Start the server
# =============================================================

FROM node:20-alpine

# Working directory inside the container
WORKDIR /app

# --- Layer cache trick ---
# Copy package files before source code.
# If you only change a .js file, Docker reuses the cached npm ci layer
# and rebuilds in seconds instead of minutes.
COPY package*.json ./

# Install production dependencies only (faster + smaller image)
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# Ensure uploads directory exists (multer writes here)
RUN mkdir -p uploads

# Document the port — doesn't actually publish it, just metadata
EXPOSE 5000

# Health check — docker-compose uses this to know the backend is ready
# before starting the frontend container.
# wget is built into alpine. Checks /health every 15s.
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Start the Express server
CMD ["node", "server.js"]

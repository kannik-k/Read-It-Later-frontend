# Build stage
FROM node:latest AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/dist /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

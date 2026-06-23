# ==========================================
# Etapa 1: Construcción (Build)
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiestos e instalar dependencias de forma limpia
COPY package*.json ./
RUN npm ci

# Copiar el resto del código de la aplicación
COPY . .

# Construir el proyecto en modo producción
RUN npm run build -- --configuration=production

# ==========================================
# Etapa 2: Servidor de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# CRUCIAL: Se usa la ruta con '/browser' debido al nuevo Application Builder de Angular
COPY --from=build /app/dist/gamarra-gestion-front/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para soportar rutas de SPA (Angular Routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
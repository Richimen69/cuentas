# Usar una imagen oficial de Node.js ligera
FROM node:20-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación (Vite frontend + esbuild backend)
RUN npm run build

# Exponer el puerto interno que usa la aplicación
EXPOSE 3000

# Comando para iniciar el servidor en producción
CMD [ "npm", "start" ]
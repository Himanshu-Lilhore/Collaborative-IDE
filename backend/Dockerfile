FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=3000
ENV FRONTEND_URL=http://localhost:5173
RUN npx tsc
EXPOSE 3000
CMD ["npm", "start"]
FROM node
COPY package*.json /backend/
WORKDIR /backend
RUN npm install
COPY . /backend/
EXPOSE 5000
CMD ["node", "app.js"]
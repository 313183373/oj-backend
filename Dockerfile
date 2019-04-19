FROM ubuntu:16.04
RUN apt update \
    && apt install -y curl apt-transport-https gnupg-agent software-properties-common \
    && curl -sL https://deb.nodesource.com/setup_11.x | bash - \
    && apt install -y nodejs
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - \
    && add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    && apt update \
    && apt install -y docker-ce docker-ce-cli containerd.io
COPY package*.json /backend/
WORKDIR /backend
RUN npm install
COPY . /backend/
EXPOSE 5000
CMD ["node", "app.js"]
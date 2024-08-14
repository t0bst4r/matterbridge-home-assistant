FROM node:20-slim

ENV HAMH_CONFIG_FILE=""
ENV HAMH_CONFIG=""
ENV LOG_LEVEL="info"

ENV FRONTEND_PORT="8080"
ENV MATTER_PORT="5540"

# Web UI
EXPOSE 8080
# Matter
EXPOSE 5540

VOLUME /root/.matterbridge

RUN apt-get update && apt-get install -y jq

RUN mkdir /app
WORKDIR /app

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY artifact.tgz /app/artifact.tgz
RUN chmod a+x docker-entrypoint.sh

RUN npm install -g /app/artifact.tgz

CMD ["./docker-entrypoint.sh"]

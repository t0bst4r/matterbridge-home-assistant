FROM node:20-slim

ENV MHA_CONFIG_FILE=""
ENV MHA_CONFIG=""
ENV LOG_LEVEL="info"

ENV FRONTEND_PORT="8283"
ENV MATTER_PORT="5540"

# Web UI
EXPOSE 8283
# Matter
EXPOSE 5540

VOLUME /root/.matterbridge

RUN apt-get update && apt-get install -y jq

RUN mkdir /app
WORKDIR /app

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY artifact.tgz /app/artifact.tgz
RUN chmod a+x docker-entrypoint.sh

RUN MATTERBRIDGE_VERSION=$(tar -zxOf /app/artifact.tgz package/package.json | jq ".devDependencies.matterbridge")
RUN echo "Matterbridge: ${MATTERBRIDGE_VERSION}"
RUN npm install -g \
      matterbridge@$MATTERBRIDGE_VERSION \
      /app/artifact.tgz

CMD ["./docker-entrypoint.sh"]

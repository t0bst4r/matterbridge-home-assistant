FROM node:20-slim

ARG ARTIFACT_VERSION

ENV MHA_CONFIG_FILE=""
ENV MHA_CONFIG=""
ENV LOG_LEVEL="info"

ENV FRONTEND_PORT="8283"
ENV MATTER_PORT="5540"

ENV SSL="false"

# Web UI
EXPOSE 8283
# SSL
EXPOSE 8443
# Matter
EXPOSE 5540

VOLUME /root/.matterbridge

RUN apt-get update && apt-get install -y jq

RUN mkdir /app
WORKDIR /app

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod a+x docker-entrypoint.sh

RUN MATTERBRIDGE_VERSION=$(npm view matterbridge-home-assistant@$ARTIFACT_VERSION devDependencies.matterbridge) && \
    echo "Matterbridge: ${MATTERBRIDGE_VERSION}" && \
    npm install -g \
    matterbridge@$MATTERBRIDGE_VERSION \
    matterbridge-home-assistant@$ARTIFACT_VERSION

CMD ["./docker-entrypoint.sh"]

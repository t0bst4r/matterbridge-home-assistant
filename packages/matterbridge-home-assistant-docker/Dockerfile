FROM node:20-slim

ARG MATTERBRIDGE_VERSION
ARG MATTERBRIDGE_HOME_ASSISTANT_VERSION

ENV MHA_CONFIG_FILE=""
ENV MHA_CONFIG=""
ENV LOG_LEVEL="info"
ENV npm_config_legacy_peer_deps="true"

# Web UI
EXPOSE 8283
# Matter
EXPOSE 5540

VOLUME /root/.matterbridge

RUN apt-get update && apt-get install -y jq

RUN mkdir /app
WORKDIR /app

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod a+x docker-entrypoint.sh

RUN npm install -g \
    matterbridge@$MATTERBRIDGE_VERSION \
    matterbridge-home-assistant@$MATTERBRIDGE_HOME_ASSISTANT_VERSION

CMD ["./docker-entrypoint.sh"]

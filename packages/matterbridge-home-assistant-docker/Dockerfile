FROM node:20-slim

ARG MATTERBRIDGE_VERSION
ARG MATTERBRIDGE_HOME_ASSISTANT_VERSION

ENV HOME_ASSISTANT_URL="http://homeassistant:8123"
ENV HOME_ASSISTANT_ACCESS_TOKEN=""
ENV HOME_ASSISTANT_CLIENT_CONFIG="{}"
ENV CONFIG_FILE=""

# Web UI
EXPOSE 8283
# Web Socket (used by the UI)
EXPOSE 8284
# Matter
EXPOSE 5540

VOLUME /root/.matterbridge

RUN apt-get update && apt-get install -y jq

RUN mkdir /app
WORKDIR /app

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod a+x docker-entrypoint.sh

RUN npm config set legacy-peer-deps true \
    && npm install -g \
    matterbridge@$MATTERBRIDGE_VERSION \
    matterbridge-home-assistant@$MATTERBRIDGE_HOME_ASSISTANT_VERSION

CMD ["./docker-entrypoint.sh"]

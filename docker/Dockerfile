FROM node:18-alpine

ARG MATTERBRIDGE_VERSION

ENV HOME_ASSISTANT_URL "http://homeassistant:8123"
ENV HOME_ASSISTANT_ACCESS_TOKEN ""
ENV MATTERBRIDGE_HOME_ASSISTANT_CONFIG "{}"

# Web UI
EXPOSE 8283
# Web Socket (used by the UI)
EXPOSE 8284
# Matter
EXPOSE 5540

VOLUME /root/.matterbridge

RUN mkdir /app
WORKDIR /app

RUN npm init -y \
    && npm install matterbridge@$MATTERBRIDGE_VERSION

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY matterbridge-home-assistant.tgz /app/matterbridge-home-assistant.tgz

RUN npm install ./matterbridge-home-assistant.tgz \
    && rm -f ./matterbridge-home-assistant.tgz

CMD "./docker-entrypoint.sh"

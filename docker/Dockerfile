FROM node:18-alpine

ARG MATTERBRIDGE_VERSION

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

RUN apk add jq

RUN mkdir /app
WORKDIR /app

RUN npm install -g matterbridge@$MATTERBRIDGE_VERSION

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod a+x docker-entrypoint.sh

COPY matterbridge-home-assistant.tgz /app/matterbridge-home-assistant.tgz

RUN npm install -g ./matterbridge-home-assistant.tgz \
    && rm -f ./matterbridge-home-assistant.tgz

CMD ["./docker-entrypoint.sh"]

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

RUN npm install -g matterbridge@$MATTERBRIDGE_VERSION

COPY matterbridge-home-assistant.tgz /matterbridge-home-assistant.tgz
RUN npm install -g /matterbridge-home-assistant.tgz
RUN rm -f /matterbridge-home-assistant.tgz

RUN matterbridge -add matterbridge-home-assistant

CMD [ "matterbridge", "-bridge" ]

FROM searchathing/dotnet:bionic

RUN mkdir -p /root/.config/workedhourstracker

COPY clone /src

RUN \
	cd /src/WorkedHoursTrackerClient && ls -la && \
	bower install --allow-root && \
	cd /src/WorkedHoursTrackerWebapi && \
	dotnet build -c Release

RUN \
	npm install -g local-web-server

COPY config.json /root/.config/workedhourstracker
RUN chmod 700 /root/.config/workedhourstracker
RUN sed -i 's/debugmode = true/debugmode = false/g' /src/WorkedHoursTrackerClient/app.js
COPY supervisorwebapi.conf /etc/supervisor/conf.d
COPY supervisorws.conf /etc/supervisor/conf.d

COPY entrypoint.sh /entrypoint.d/wht

CMD /bin/bash

FROM node:20-alpine

ENV APP_HOME=/app \
    APP_USER=appuser

WORKDIR $APP_HOME

COPY package.json .
RUN npm install

COPY . .

RUN addgroup --system $APP_USER \
    && adduser --system --ingroup $APP_USER $APP_USER \
    && chown -R $APP_USER:$APP_USER $APP_HOME

EXPOSE 5173

USER $APP_USER

CMD ["npm", "run", "dev"]

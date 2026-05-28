FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_HOME=/app \
    APP_USER=appuser

WORKDIR $APP_HOME

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN addgroup --system $APP_USER \
    && adduser --system --ingroup $APP_USER $APP_USER \
    && chown -R $APP_USER:$APP_USER $APP_HOME \
    && chmod +x entrypoint.sh

EXPOSE 8000

USER $APP_USER

CMD ["/app/entrypoint.sh"]

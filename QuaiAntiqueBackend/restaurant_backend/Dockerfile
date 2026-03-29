FROM php:8.3-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libpq-dev \
        libssl-dev \
        pkg-config \
    && docker-php-ext-install pdo pdo_pgsql \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json ./
COPY composer.lock* ./

ENV APP_ENV=prod
ENV APP_DEBUG=0

RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --no-plugins

COPY . .

RUN test -f autoload_runtime.php && test -f vendor/autoload.php

EXPOSE 8080

CMD ["sh", "-c", "if [ ! -f vendor/autoload.php ]; then composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --no-plugins; fi; php -S 0.0.0.0:${PORT:-8080} -t public"]
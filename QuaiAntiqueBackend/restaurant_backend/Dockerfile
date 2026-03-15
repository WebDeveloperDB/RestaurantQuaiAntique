FROM php:8.3-cli-bookworm

# System packages and PHP extensions needed by Symfony + PostgreSQL + MongoDB
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

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

EXPOSE 8080

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t public"]

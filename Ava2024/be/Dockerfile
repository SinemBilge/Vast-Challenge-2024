FROM python:3.9

ENV PYTHONUNBUFFERED 1

# Add the PostgreSQL APT repository to get the latest versions of libpq
RUN apt-get update && apt-get install -y \
    wget \
    gnupg2 \
    ca-certificates \
    lsb-release

RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Install the latest libpq-dev and other dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app/

RUN chmod +x /app/django.sh

EXPOSE 8000

ENTRYPOINT ["/app/django.sh"]

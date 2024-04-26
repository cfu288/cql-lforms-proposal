# example cql execution in the browser

Demo of running cql expressions in the browser.

For examples where an elm representation is not provided, an external api service [cql-translation-service](https://github.com/cqframework/cql-translation-service) is required to be running to translate the CQL into executable ELM.

Note: Requires running cql-translation-service at localhost:8080, or using the hosted version at `https://cqltranslationservice.foureighteen.dev/cql/translator`.

```bash
cd web-demo
npm run dev
```

## Dependencies for demo

Requires [cql-translation-service](https://github.com/cqframework/cql-translation-service) to be running to translate CQL into executable ELM. It is included as a submodule in this repo. Changes have been made to the dockerfile to make it compatible with the web client in web-demo.

```bash
cd cql-translation-service
git submodule init
git submodule update
docker build -t cql-translation-service .
docker run -t -i -p 8080:8000 cql-translation-service
```

## Dependencies

Requires [cql-translation-service](https://github.com/cqframework/cql-translation-service) to be running to translate CQL into executable ELM.

Note after cloning the repo, you will need to update the dockerfile to below:

```Dockerfile
# fetch basic image
FROM maven:3.9.5-eclipse-temurin-11

# install nginx
RUN apt-get update && apt-get install -y nginx

# application placed into /opt/app
RUN mkdir -p /app
WORKDIR /app

# selectively add the POM file and
# install dependencies
COPY pom.xml /app/
RUN mvn install

# rest of the project
COPY src /app/src
RUN mvn package

# copy nginx configuration file
COPY nginx.conf /etc/nginx

# local application port
EXPOSE 8000

# start nginx and run the application
CMD service nginx start && java -jar target/cqlTranslationServer-2.4.0.jar -d
```

Add the following to the nginx.conf file:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
    server localhost:8080;
    }

    server {
    listen 8000;
    server_name localhost;

    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        if ($request_method = 'POST') {
            add_header 'Access-Control-Allow-Origin' '*';
        }
        if ($request_method = 'GET') {
            add_header 'Access-Control-Allow-Origin' '*';
        }
        proxy_pass http://api/;
    }
    }
}
```

Run the service

```bash
docker build -t cql-translation-service .
docker run -t -i -p 8080:8000 cql-translation-service
```

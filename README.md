# Exploring support for CQL in SDC Questionnaires and potential for executing CQL in the browser

Repo researching how to add CQL support in Questionnaires to [lforms](https://github.com/lhncbc/lforms).

See demo under `web-demo` directory. Requires [cql-translation-service](https://github.com/cqframework/cql-translation-service) to be running to translate CQL into executable ELM.

## **Inline CQL example**

```json
{
  "resourceType": "Questionnaire",
  "status": "draft",
  "id": "Example-CQL-Calculation-Questionnaire",
  "title": "Example CQL Calculation Questionnaire",
  "item": [
    {
      "text": "Multiply 2 * 3 (text/cql)",
      "type": "string",
      "required": false,
      "extension": [
        {
          "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
          "valueExpression": {
            "description": "Multiply two numbers via cql expression",
            "language": "text/cql",
            "expression": "2 * 3"
          }
        }
      ]
    }
  ]
}
```

## **External CQL Example**

```json
{
  "resourceType": "Questionnaire",
  "status": "draft",
  "id": "Example-CQL-Calculation-Questionnaire",
  "title": "Example CQL Calculation Questionnaire",
  "extension": [
    {
      "url": "http://hl7.org/fhir/StructureDefinition/cqf-library",
      "valueString": "http://example.com/ExampleExternalCQLLibrary",
      "name": "ExampleExternalCQLLibrary",
      "description": "External CQL Library that contains an expression 'externalMultiplyFn'"
    }
  ],
  "item": [
    {
      "text": "Multiply 2 * 3 in text/cql using external library",
      "type": "string",
      "required": false,
      "extension": [
        {
          "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
          "valueExpression": {
            "description": "Multiply two numbers via cql expression found in an external library.",
            "language": "text/cql",
            "reference": "\"ExampleExternalCQLLibrary\".externalMultiplyFn"
          }
        }
      ]
    }
  ]
}
```

## Run the demo

[![demo video](https://github.com/cfu288/cql-lforms-proposal/assets/2985976/ac32716f-c673-480e-93da-c0821586c8a9)](https://github.com/cfu288/cql-lforms-proposal/assets/2985976/ac32716f-c673-480e-93da-c0821586c8a9)

Note: Requires running cql-translation-service at localhost:8080

```bash
cd web-demo
npm run dev
```

### Dependencies for demo

Requires [cql-translation-service](https://github.com/cqframework/cql-translation-service) to be running to translate CQL into executable ELM.

Note after cloning the [cql-translation-service](https://github.com/cqframework/cql-translation-service) repo, you will need to make a few changes to make it compatible with this demo:

Update the dockerfile to below:

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

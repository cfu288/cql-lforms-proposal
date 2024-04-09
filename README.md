# Exploring support for CQL in SDC Questionnaires and potential for executing CQL in the browser

Repo researching how to add CQL support in Questionnaires to [lforms](https://github.com/lhncbc/lforms).

See demo under `web-demo` directory. Requires [cql-translation-service](https://github.com/cqframework/cql-translation-service) to be running to translate CQL into executable ELM (which a modified version has been included as a submodule).

## **Inline CQL example in FHIR Questionnaire**

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

## **External CQL Library Example in FHIR Questionnaire**

- https://hl7.org/fhir/R5/library.html

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

Requires [cql-translation-service](https://github.com/cqframework/cql-translation-service) to be running to translate CQL into executable ELM. It is included as a submodule in this repo. Changes have been made to the dockerfile to make it compatible with the web client in web-demo.

```bash
cd cql-translation-service
git submodule init
git submodule update
docker build -t cql-translation-service .
docker run -t -i -p 8080:8000 cql-translation-service
```

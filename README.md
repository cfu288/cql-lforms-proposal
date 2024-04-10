# Exploring support for CQL in SDC Questionnaires and potential for executing CQL in the browser

This repository explores the feasibility of adding support for CQL in FHIR Questionnaires. The goal is to allow for the execution of CQL expressions in the browser. This would allow for the creation of dynamic forms that can calculate values based on CQL expressions.

The ultimate goal is to add CQL support to [LForms](https://github.com/lhncbc/lforms).

The goal is to allow for the following:

- Within a FHIR Questionnaire, allow for the inclusion of inline CQL expressions that can be executed in the browser.
  - This requires the ability to either
    1. Translate the CQL inline expression into ELM
    2. Have the ELM representation provided alongside of the CQL inline expression using a [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) extension.
- Within a FHIR Questionnaire, allow for the inclusion of references to external CQL libraries that can be used to execute CQL expressions in the browser.
  - This requires the ability to either
    1. Fetch the external CQL library and translate it into ELM
    2. Have the ELM representation provided alongside of the CQL library using a [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension.

[This repository is accompanied by a live demo here](https://cfu288.github.io/cql-lforms-proposal/). See source for demo under `web-demo` directory. For examples where an elm representation is not provided, an external api service[cql-translation-service](https://github.com/cqframework/cql-translation-service) is required to be running to translate the CQL into executable ELM. A modified version of that service has been included in this repo as a submodule). I am hosting a version of the translation service at `https://cqltranslationservice.foureighteen.dev/cql/translator` for the purposes of this demo.

## Barriers to implementation

- The current IGs for including CQL (both expressions and libraries) in questionnaires is not clear, with no easy to find example FHIR questionnaires that show how this might be done (Hopefully this repository can help with that!).
- Currently, the reference CQL to ELM translation service is not available in the browser. This requires the use of a server-side service to translate CQL to ELM.
- Currently, the reference ELM to CQL translation service does not translate inline CQL expressions to elm. This makes publishing the ELM representation of the CQL expression alongside the CQL expression impossible.

# Example Questionnaires with CQL and ELM

## **Inline CQL + ELM example in FHIR Questionnaire**

```json
{
  "resourceType": "Questionnaire",
  "id": "Example-CQL-Calculation-Questionnaire",
  "title": "Example CQL Calculation Questionnaire",
  "item": [
    {
      "text": "Multiply 2 * 3",
      "type": "string",
      "extension": [
        {
          "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
          "valueExpression": {
            "description": "Multiply two numbers via cql expression",
            "language": "text/cql",
            "expression": "2 * 3",
            "extension": [
              {
                "url": "http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension",
                "valueExpression": {
                  "language": "application/elm+json",
                  "expression": "{\"library\": \"Insert Valid Library ELM Here\"}",
                  "description": "Multiply two numbers via cql expression - Elm JSON"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## **External CQL+ELM Library Example in FHIR Questionnaire**

```json
{
  "resourceType": "Questionnaire",
  "id": "Example-CQL-Calculation-Questionnaire",
  "title": "Example CQL Calculation Questionnaire",
  "extension": [
    {
      "url": "http://hl7.org/fhir/StructureDefinition/cqf-library",
      "valueCanonical": "http://example.com/ExampleExternalCQLLibrary"
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

### **http://example.com/ExampleExternalCQLLibrary**

```json
{
  "resourceType": "Library",
  "url": "http://example.com/ExampleExternalCQLLibrary",
  "name": "ExampleExternalCQLLibrary",
  "description": "External CQL Library that contains an expression 'externalMultiplyFn' and 'externalDateTimeFn'. References to content are in 'content' array. Note that these are external refs but could be embedded in this resource under 'content.data' as a base64 encoded string.",
  "content": [
    {
      "contentType": "text/cql",
      "url": "https://cfu288.github.io/cql-lforms-proposal/ExampleExternalCQLLibrary/ExampleExternalCQLLibrary.cql"
    },
    {
      "contentType": "application/elm+json",
      "url": "https://cfu288.github.io/cql-lforms-proposal/ExampleExternalCQLLibrary/ExampleExternalCQLLibrary.json"
    }
  ]
}
```

# Run the demo locally

[![demo video](https://github.com/cfu288/cql-lforms-proposal/assets/2985976/ac32716f-c673-480e-93da-c0821586c8a9)](https://github.com/cfu288/cql-lforms-proposal/assets/2985976/ac32716f-c673-480e-93da-c0821586c8a9)

Note: Requires running cql-translation-service at localhost:8080

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

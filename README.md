# Exploring support for CQL in SDC Questionnaires and potential for executing CQL in the browser

See demo under `web-demo` directory. Requires [cql-translation-service](https://github.com/cqframework/cql-translation-service) to be running to translate CQL into executable ELM.

## Run the demo

Note: Requires running cql-translation-service at localhost:8080

```bash
cd web-demo
npm run dev
```

#### **Inline CQL example**

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

#### **External CQL Library Example**

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
          "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression.",
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

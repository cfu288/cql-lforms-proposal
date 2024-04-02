https://build.fhir.org/ig/HL7/sdc/examples.html#cqf

Queries are currenlty used int he folloowing locations:

- initialExpression
- calculatedExpression
- variable
- answerExpression
- candidateExpression
- contextExpression
- ... and more

https://build.fhir.org/ig/HL7/sdc/expressions.html

Current examples with FHIR path:

#### **`rxterms.json`**

```json
{
    ...
    "extension": [
        {
            "url": "http://hl7.org/fhir/StructureDefinition/variable",
            "valueExpression": {
                "name": "weight",
                "language": "text/fhirpath",
                "expression": "%resource.item.where(linkId='/29463-7').answer.value"
            }
        },
        {
            "url": "http://hl7.org/fhir/StructureDefinition/variable",
            "valueExpression": {
                "name": "height",
                "language": "text/fhirpath",
                "expression": "%resource.item.where(linkId='/8302-2').answer.value*0.0254"
            }
        }
    ],
    ...
    "extension": [
        {
          "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-unit",
          "valueCoding": {
            "system": "http://unitsofmeasure.org",
            "code": "kg/m2"
          }
        },
        {
          "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
          "valueExpression": {
            "description": "BMI calculation",
            "language": "text/fhirpath",
            "expression": "(%weight/(%height.power(2))).round(1)"
          }
        }
    ],
}

```

# CQL

A MVP single line expression could be:

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
            "description": "Multiply two numbers via cql expression (todo)",
            "language": "text/cql",
            "expression": "2 * 3"
          }
        }
      ]
    }
  ]
}
}
```

The R5 spec mentions that there are subsets of the language type for cql

<!--
https://build.fhir.org/ig/HL7/sdc/expressions.html
https://www.hl7.org/fhir/clinicalreasoning-topics-using-expressions.html
Clinical Quality Language - text/cql
Clinical Quality Language Identifier - text/cql-identifier
Clinical Quality Language Expression - text/cql-expression
-->

SDC does not mention the CQL language type, but uses `text/cql` as the language type for CQL expressions.

External libraries use a `reference` instead of a direct `expression` value, where the reference must refer to content from a library imported using the cqf-library extension.

```json
{
    // inline
  "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression", // can be used for initialExpression, calculatedExpression, variable, answerExpression
  "valueExpression": {
    "description": "BMI calculation",
    "language": "text/cql-expression",
    "expression": "<expression here>"
  },
  //or name of expression in referenced library
  { // library
    "extension" : [ //  sliced by value:url  in the specified order, Open
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/cqf-library", // R!
        // "valueCanonical" : "<canonical>" // C? R! Value of extension
        "valueString": "http://example.org/Library/ExternalExampleDateLib"
      },
      ...
    ],
    "item": [
      {
        "linkId" : "3.4.2",
        "text" : "Autopopulated current date using external lib",
        "type" : "string",
        "extension" : [
          {
            "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
            "valueExpression" : {
              "description" : "current date",
              "name" : "currentDate",
              "language" : "text/cql",
              "reference" : "#currentDate",
            }
          }
        ]
      }
    ],
  }
}
```

CQL queries are multi-line expressions that need to be represented as a JSON string, so the expression should be escaped and formatted as a single line string.

CQL Retrieve statement (doesn't make sense without context)

```json
{
    ...
  "valueExpression": {
    "description": "Acute Pharyngitis in 2013",
    "language": "text/cql",
    "expression": "[Condition: \"Acute Pharyngitis\"] C where C.onsetDateTime during Interval[@2013-01-01, @2013-12-31]"
  }
}
```

# Exploring support for CQL in SDC Questionnaires and potential for executing CQL in the browser

[This repository is accompanied by a live demo](https://cfu288.github.io/cql-lforms-proposal/).

This repository explores the feasibility of adding support for CQL in FHIR Questionnaires. The goal is to allow for the execution of CQL expressions in the browser. This would allow for the creation of dynamic forms that can calculate values based on CQL expressions. The ultimate goal is to add CQL support to [LForms](https://github.com/lhncbc/lforms).

To achieve this goal, the following is required:

1. Within a FHIR Questionnaire, allow for the inclusion of inline CQL expressions that can be executed in the browser. This requires the ability to either:

   1. Translate the CQL inline expression into ELM
   2. Have the ELM representation provided alongside of the CQL inline expression using a [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) extension. **Currently not supported in questionnaires**, see [this discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM).

1. Within a FHIR Questionnaire, allow for external references to CQL libraries that can be used to execute CQL expressions in the browser. This requires the ability to either
   1. Fetch the external CQL library and translate it into ELM
   2. Have the ELM representation provided alongside of the CQL library using a [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension.

## Barriers to Implementation

### Lack of clarity/examples in IGs of incorporating CQL Libraries and Inline Expressions into FHIR Questionnaires

- The current IGs for including CQL (both expressions and libraries) in questionnaires is not clear, with no easy to find example FHIR questionnaires that show how this might be done ([see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/ELM.20representations.20alongside.20CQL.20libraries.2Fexpressions/near/432725398)). Given our current understanding, I've included two examples below of how this should be done.

<details>
  <summary>Example FHIR Questionnaire with Inline CQL example</summary>

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
            "expression": "2 * 3"
          }
        }
      ]
    }
  ]
}
```

</details>

<details>
  <summary>Example FHIR Questionnaire with External CQL+ELM Library Example</summary>
  
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

Where 'http://example.com/ExampleExternalCQLLibrary' would be a reference to this library resource, which itself contains the actual CQL content:

<details>
  <summary>http://example.com/ExampleExternalCQLLibrary</summary>

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

</details>

</details>

### Issues with fully in-browser execution of CQL

Since the CQL translation service is written in Java, it is not realistically possible to run it in the browser. This requires the use of a server-side service to translate CQL to ELM, or allowing users to provide the ELM representation. However, allowing users to provide the ELM representation has its own issues (particularly inline expressions as discussed below):

#### Issues with inline CQL and ELM expressions

- Currently, the reference ELM to CQL translation service does not translate inline CQL expressions to ELM. This makes publishing the ELM representation of the CQL expression alongside the CQL expression impossible. See ([this discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM)).
  - Currently, [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) is not supported in questionnaires [see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/US.20Public.20Health.20Alternative.20Expressions.20in.20Questionnaires), so even if we could generate an ELM representation of an inline CQL expression, it would not be possible to include it in the questionnaire.

### Suggested Implementation Path

- Focus on handling references to external CQL (or CQL+ELM) libraries first, as this is the most feasible path forward. It is clear how to provide support for CQL+ELM in a FHIR Library resource, and allowing the Questionnaire to reference this library is a straightforward extension. This would allow for the execution of CQL expressions in the browser without the need for a server-side translation service.

- We can use profiles to explain what level of support we are providing in lforms for CQL ([see discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM/near/434413498)).

# About this demo

[This repository is accompanied by a live demo here](https://cfu288.github.io/cql-lforms-proposal/).

This demo touches upon the following:

1. Execution of inline CQL expressions in the browser, using an external CQL translation service to convert the CQL to ELM just prior to executing the ELM in the browser.
2. Parsing a FHIR questionnaire that contains an inline CQL expression, handing translation of the inline CQL using a external CQL translation service to retrieve the ELM representation, and executing the returned ELM in the browser.
3. Parsing a FHIR questionnaire that contains a reference to an external CQL+ELM or only CQL library, and executing the reference to a method from that library in the browser. If the external library only contains CQL, handing translation of the inline CQL using a external CQL translation service to retrieve the ELM representation, and executing the returned ELM in the browser

The demo depends on an external api [cql-translation-service](https://github.com/cqframework/cql-translation-service), which I am hosting at [https://cqltranslationservice.foureighteen.dev/cql/translator](https://cqltranslationservice.foureighteen.dev/cql/translator) for the purposes of this demo.

[![demo video](https://github.com/cfu288/cql-lforms-proposal/assets/2985976/ac32716f-c673-480e-93da-c0821586c8a9)](https://github.com/cfu288/cql-lforms-proposal/assets/2985976/ac32716f-c673-480e-93da-c0821586c8a9)

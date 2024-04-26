# Exploring CQL Support in SDC Questionnaires and Potential for Executing CQL in the Browser

[This repository is accompanied by a live demo](https://cfu288.github.io/cql-lforms-proposal/).

This repository explores the feasibility of adding support for CQL in FHIR Questionnaires. The goal is to allow for the execution of CQL expressions and libraries in the browser. This would allow for the creation of dynamic forms that can calculate values based on CQL expressions. The ultimate goal is to add CQL support to [lforms](https://github.com/lhncbc/lforms).

To achieve this goal, accomplishing some of the following steps are required:

1. Within a FHIR Questionnaire, allow for the inclusion of inline CQL expressions that can be executed in the browser. This requires the ability to either:

   - Translate the CQL inline expression into ELM in the browser
   - Have the ELM representation provided alongside of the CQL inline expression using a [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) extension. **However, this extension is currently not supported in questionnaires**, see [this discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM).

2. Within a FHIR Questionnaire, allow for external references to CQL libraries that can be used to execute CQL expressions in the browser. This requires the ability to either:
   - Fetch the external CQL library and translate it into ELM
   - Have the ELM representation provided alongside of the CQL library using a [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension.

# Barriers to Implementation

## Lack of clarity/examples in IGs of incorporating CQL Libraries and Inline Expressions into FHIR Questionnaires

- The current IGs for including CQL (both expressions and libraries) in questionnaires is not clear, with no easy to find example FHIR questionnaires that show how this might be done ([see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/ELM.20representations.20alongside.20CQL.20libraries.2Fexpressions/near/432725398)). Given our current understanding, I've included two examples below of how this should be done.

<details>
  <summary>Click Here to See Example FHIR Questionnaire with Inline CQL example</summary>

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
  <summary>Click Here to See Example FHIR Questionnaire with External CQL+ELM Library Example</summary>
  
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
</br>

## Issues with fully in-browser execution of CQL

Currently, raw CQL cannot be executed in the browser natively. CQL has an intermediary format it must be converted to called ELM, which can then be executed in the browser environment [using a js library](https://github.com/cqframework/cql-execution). There is a [reference CQL to ELM translation service](https://github.com/cfu288/cql-translation-service) available, however it is currently not feasible to run it in the browser. This means in order to run CQL, lforms would be dependent on a server-side CQL to ELM translation service. Currently, this is undesirable for our lforms implementation - the current request is to complete all processing in the browser.

Note that there is some precedent to allow for users to provide ELM directly alongside CQL expressions in order to skip this in-browser translation step, however there are limitations to this approach as well, particularly with inline expressions (discussed below).

### Issues with Inline CQL and ELM Expressions

Currently, the reference ELM to CQL translation service does not translate inline CQL expressions to ELM. This makes publishing the ELM representation of the CQL expression alongside the CQL expression impossible. See ([this discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM)).

Even if it were possible to generate inline ELM, there currently isn't a way to represent it in FHIR questionnaires. There is an extension [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) that could theoretically allow for us to provide the elm representation alongside the CQL, but it is not supported in questionnaires [see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/US.20Public.20Health.20Alternative.20Expressions.20in.20Questionnaires). So even if we could generate an ELM representation of an inline CQL expression, it would not be possible to include it in the questionnaire.

This limitation does not apply to references to external CQL libraries, as the ELM representation can be provided alongside the CQL library using a [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension.

## Suggested Implementation Path

Given the above barriers, the following implementation path is suggested:

Focus on handling references to external CQL (or CQL+ELM) libraries first in questionnaires instead of inline CQL. The pathway to implementing computable questionnaires with external CQL or CQL+ELM library references seems more straightforward than their inline counterparts.

Users can generate CQL + ELM libraries offline, and publish these libraries online to be referenced by their questionnaire. This would allow for the execution of CQL expressions in the browser without the need for a server-side translation service, nor would users run into the issue of not being able to generate ELM representations of inline CQL expressions.

We should be able to describe the capabilities of our questionnaire as a 'executable' questionnaire by using profiles (vs a 'computable' one) to explain the level of CQL support lforms provides ([see discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM/near/434413498)), although how to do that isn't clear to me.

# About this demo

[This repository is accompanied by a live demo here](https://cfu288.github.io/cql-lforms-proposal/). This technical demo shows an example of each of the following:

1. Demo 1: Execution of inline CQL expressions in the browser, using an external CQL translation service to convert the CQL to ELM just prior to executing the ELM in the browser.
2. Demo 2: Parsing a FHIR questionnaire that contains an inline CQL expression, handing translation of the inline CQL using a external CQL translation service to retrieve the ELM representation, and executing the returned ELM in the browser.
3. Demo 3: Parsing a FHIR questionnaire that contains a reference to an external CQL+ELM or only CQL library, and executing the reference to a method from that library in the browser. If the external library only contains CQL, handing translation of the inline CQL using a external CQL translation service to retrieve the ELM representation, and executing the returned ELM in the browser

To see each demo, scroll to the top of this live demo site and click on the relevant tab.

The demo depends on an external api [cql-translation-service](https://github.com/cqframework/cql-translation-service), which I am hosting at [https://cqltranslationservice.foureighteen.dev/cql/translator](https://cqltranslationservice.foureighteen.dev/cql/translator) for the purposes of this demo.

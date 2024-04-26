# Exploring CQL Support in SDC Questionnaires and Potential for Executing CQL in the Browser

[This repository is accompanied by a live demo](https://cfu288.github.io/cql-lforms-proposal/).

# Purpose

This repository explores the feasibility of adding support for CQL in FHIR Questionnaires to [lforms](https://github.com/lhncbc/lforms), enabling execution of user provided CQL expressions and libraries within questionnaires in the browser. Enabling this would allow for the creation of dynamic forms that can calculate values of items in a form based on user provided CQL expressions and libraries.

# Requirements

To fully achieve this purpose, accomplishing the following steps are required:

1. Within a FHIR Questionnaire, allow for the inclusion of inline CQL expressions that can be executed in the browser.
2. Within a FHIR Questionnaire, allow for external references to CQL libraries that can be used to execute CQL expressions in the browser.

Note: an additional limitation for integration with lforms is to ideally reduce dependencies on external API services for any steps in this process.

# Technical Limitations/Barriers to Implementation

## Translation of CQL to ELM in the Browser

Currently, raw CQL is not intended to be interpreted and run directly in most environments. Instead, it is translated into an intermediate format called ELM, which can then be executed in different environments, including the browser. This means that in order to run CQL in the browser, we would need to translate the CQL to ELM first.

However, the [current reference implementation for translating CQL to ELM](https://github.com/cfu288/cql-translation-service) is not designed to be run in the browser. This means that in order to run CQL in the browser, we would need to rely on a external hosted translation service to convert the CQL to ELM, which is not ideal for our purposes since we want to limit compute to the browser. Note that once the ELM representation _is_ generated, it can be executed in the browser using a js library like [cql-execution](https://github.com/cqframework/cql-execution).

One workaround to this limitation is to allow users to provide the ELM representation of the CQL a using the [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) for CQL inline expressions or via the the [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension for CQL libraries. This would allow for the execution of CQL expressions in the browser without the need for a server-side translation service. However, there are limitations to this approach as well, particularly with inline expressions (discussed below).

## Issues with Inline CQL and ELM Expressions

Currently, the reference ELM to CQL translation service does not translate inline CQL expressions to ELM. This makes publishing the ELM representation of the CQL expression alongside the CQL expression impossible. See ([this discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM)).

Even if it were possible to generate inline ELM, there currently isn't a way to represent it in FHIR questionnaires. There is an extension [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) that could theoretically allow for us to provide the elm representation alongside the CQL, but it is not supported in questionnaires [see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/US.20Public.20Health.20Alternative.20Expressions.20in.20Questionnaires).

So even if we could generate an ELM representation of an inline CQL expression, it would not be possible to include it in the questionnaire.

This limitation does not apply to references to external CQL libraries, as the ELM representation can be provided alongside the CQL library using a [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension.

## Lack of clarity/examples in IGs of incorporating CQL Libraries and Inline Expressions into FHIR Questionnaires

- The current IGs for including CQL (both expressions and libraries) in questionnaires is not clear, with no easy to find example FHIR questionnaires that show how this might be done ([see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/ELM.20representations.20alongside.20CQL.20libraries.2Fexpressions/near/432725398)). Given our current understanding, I've included two examples below of how I believe these questionnaires should be formatted:

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

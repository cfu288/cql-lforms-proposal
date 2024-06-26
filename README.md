# Exploring CQL Support in SDC Questionnaires and Potential for Executing CQL in the Browser

[A live demo accompanies this repository](https://cfu288.github.io/cql-lforms-proposal/).

# Introduction

This repository explores the feasibility of adding support for CQL in FHIR Questionnaires (and eventually to [lforms](https://github.com/lhncbc/lforms)), enabling the execution of user-provided CQL expressions and libraries within questionnaires in the browser. Enabling this would allow for the creation of dynamic forms that can calculate the values of items in a form based on user-provided CQL expressions and libraries.

This repository and demo are intended for developers and implementers who are interested in understanding the technical limitations and potential pathways to implementing CQL support in FHIR Questionnaires within lforms.

# Requirements

To fully achieve this goal, the following functionality would be required:

1. Within an FHIR Questionnaire, allow for the execution of user-provided inline CQL expressions in the browser.
2. Within an FHIR Questionnaire, allow users to provide external references to CQL libraries that can be used to execute CQL libraries in the browser.

An additional technical requirement for integration with lforms is to limit dependencies on external API services for any steps in this process, therefore limiting the compute of CQL to the browser.

# Technical Limitations/Barriers to Implementation

## Translation of CQL to ELM in the Browser

Currently, raw CQL is not intended to be interpreted and run directly in most environments. Instead, raw CQL is translated into an intermediate format called ELM, which can then be executed in different environments, including the browser. This means that in order to run CQL in the browser, we would need to translate the CQL to ELM first.

However, the [current reference implementation for translating CQL to ELM](https://github.com/cfu288/cql-translation-service) is not designed to be run in the browser. This means that in order to run CQL in the browser, we would need to rely on an external hosted translation service to convert the CQL to ELM, which is not ideal for our purposes since we want to limit compute to the browser. Note that once the ELM representation _is_ generated, it can be executed in the browser using a js library like [cql-execution](https://github.com/cqframework/cql-execution).

One workaround to this limitation is to allow users to provide the ELM representation of the CQL using the [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) for CQL inline expressions or via the the [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension for CQL libraries. This would allow for the execution of CQL expressions in the browser, bypassing the need for a server-side translation service. However, this approach also has limitations, particularly with inline expressions (discussed below).

## Issues with Inline CQL and ELM Expressions

Currently, the [reference ELM to CQL translation service](https://github.com/cfu288/cql-translation-service) does not translate inline CQL expressions to ELM. This makes publishing the ELM representation of the CQL expression alongside the CQL expression impossible. See ([this discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM/near/432294574)).

Even if it were possible to generate inline ELM, there currently isn't a way to represent it in FHIR questionnaires. There is an extension [us-ph-alternative-expression-extension](http://hl7.org/fhir/us/ecr/StructureDefinition/us-ph-alternative-expression-extension) that could theoretically allow for us to provide the ELM representation alongside the CQL, but it is not supported in questionnaires [see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/US.20Public.20Health.20Alternative.20Expressions.20in.20Questionnaires).

This limitation does not apply to references to external CQL libraries, as the ELM representation can be provided alongside the CQL library using a [cqf-library](http://hl7.org/fhir/StructureDefinition/cqf-library) extension.

## Lack of Clarity/Examples in IGs Incorporating CQL Libraries and Inline Expressions into FHIR Questionnaires

The current IGs for including CQL (both expressions and libraries) in questionnaires is not clear, with no easy to find example FHIR questionnaires revealing how either should be done ([see discussion](https://chat.fhir.org/#narrow/stream/179255-questionnaire/topic/ELM.20representations.20alongside.20CQL.20libraries.2Fexpressions/near/432725398)). Given our current understanding, I've included two examples below of how I believe these questionnaires should be formatted:

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

# Suggested Implementation Path

Given the above barriers, the following implementation path is suggested: focus on handling references to external CQL (or CQL+ELM) libraries first in questionnaires while postponing support of inline CQL. The pathway to implementing computable questionnaires with external CQL or CQL+ELM library references seems more straightforward than their inline counterparts.

Users can generate CQL + ELM libraries offline, and publish these libraries online to be referenced by their questionnaire. There would be no dependency on a server-side translation service. Limited support would also bypass the issue of not being able to generate ELM representations of inline CQL expressions.

We should be able to describe the capabilities of our questionnaire as a 'executable' questionnaire by using profiles (vs a 'computable' one) to explain the level of CQL support lforms provides ([see discussion](https://chat.fhir.org/#narrow/stream/179220-cql/topic/Translating.20inline.20CQL.20to.20ELM/near/434413498)), although how to do that isn't clear to me.

# About this demo

[This repository is accompanied by a live demo here](https://cfu288.github.io/cql-lforms-proposal/). This technical demo shows an example of each of the following:

1. Demo 1: Execution of inline CQL expressions in the browser, using an external CQL translation service to convert the CQL to ELM just prior to executing the ELM in the browser.
2. Demo 2: Parsing an FHIR questionnaire that contains an inline CQL expression, handling the translation of the inline CQL using an external CQL translation service to retrieve the ELM representation, and executing the returned ELM in the browser.
3. Demo 3: Parsing an FHIR questionnaire that contains a reference to an external CQL+ELM or only CQL library and executing the reference to a method from that library in the browser. If the external library only contains CQL, handing translation of the inline CQL using an external CQL translation service to retrieve the ELM representation and executing the returned ELM in the browser

To see each demo, scroll to the top of this live demo site and click on the relevant tab.

The demo depends on an external API [cql-translation-service](https://github.com/cqframework/cql-translation-service), which I am hosting at [https://cqltranslationservice.foureighteen.dev/cql/translator](https://cqltranslationservice.foureighteen.dev/cql/translator) for this demo.

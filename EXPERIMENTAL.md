Refer to a specific identifier in a CQL library
(https://www.hl7.org/fhir/clinicalreasoning-topics-using-expressions.html)

```json
{
  "url": "http://hl7.org/fhir/StructureDefinition/cqf-library",
  "valueString": "http://example.org/Library/PHQ-9",
  "extension": [
    {
      "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
      "valueExpression": {
        "description": "PHQ-9 Score",
        "language": "text/cql-identifier",
        "expression": "PHQ9Score"
      }
    }
  ]
}
```

More complex scripts may define variables and functions, question is how do we return a value from a script?

```cql
context Patient

define "InInitialPopulation":
    AgeInYearsAt(@2013-01-01) >= 16 and AgeInYearsAt(@2013-01-01) < 24

context Unfiltered

define "InitialPopulationCount":
    Count(InInitialPopulation IP where IP is true)

InitialPopulationCount
```

We can have the last line as `InitialPopulationCount` which is the value we want to return.

```json
{
    ...
  "valueExpression": {
    "description": "Initial Population Count for Age 16-24",
    "language": "text/cql",
    "expression": "context Patient\n\n    define \"InInitialPopulation\":\n        AgeInYearsAt(@2013-01-01) >= 16 and AgeInYearsAt(@2013-01-01) < 24\n    \n    context Unfiltered\n    \n    define \"InitialPopulationCount\":\n        Count(InInitialPopulation IP where IP is true)\n    \n    InitialPopulationCount"
  }
}
```

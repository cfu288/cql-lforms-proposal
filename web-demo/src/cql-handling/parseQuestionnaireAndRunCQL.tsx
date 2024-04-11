import { Results, Library, Executor, PatientSource } from "cql-execution";
import { wrapExpressionInFunction } from "../utils/wrapExpressionInFunction";

const CALCULATABLE_EXPRESSION_URLS = [
  "http://hl7.org/fhir/StructureDefinition/variable",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-candidateExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-contextExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression",
];

type FormItems = Array<{
  extension: Array<{
    url: string;
    valueExpression: {
      description: string;
      language: string;
      expression: string | null;
      reference: string | null;
    };
  }>;
}>;

type CQFLibrary = {
  url: "http://hl7.org/fhir/StructureDefinition/cqf-library";
  valueCanonical: string;
};

/**
 * Execute a CQL library
 * @param {Object} args
 * @param {Record<string, unknown>} args.externalCqlLibraries - The external CQL library extension array, can contain multiple references to the same library (different versions like cql vs elm)
 * @param {unknown[]} args.patientSource - The patient source to execute the CQL query on
 * @param {Record<string, Library>} [args.processedLibraries] - A reference to previously processed and cached libraries
 * @returns
 */
async function executeCQLLib({
  externalCqlLibraries,
  patientSource = [],
  processedLibraries = {},
}: {
  externalCqlLibraries: CQFLibrary[];
  patientSource?: unknown[];
  processedLibraries?: Record<string, Library>;
}): Promise<{
  result: Results | null;
  elm: Record<string, unknown>;
}> {
  let library: Library | undefined;
  let libraryElm: Record<string, unknown> = {};

  const externalLibraryResource = await fetchExternalLibraryResource(
    externalCqlLibraries[0].valueCanonical
  );

  const libraryName = externalLibraryResource.name;

  if (processedLibraries[libraryName]) {
    library = processedLibraries[libraryName];
  } else {
    const elmContent = externalLibraryResource.content.find(
      (content: { contentType: string }) =>
        content.contentType === "application/elm+json"
    );
    const cqlContent = externalLibraryResource.content.find(
      (content: { contentType: string }) => content.contentType === "text/cql"
    );

    // below were assuming all external references to libs via content.url
    // TODO: handle if a base64 encoded data is provided as a content.data
    if (elmContent) {
      const elmResponse = await fetch(elmContent.url);
      const elmJson = await elmResponse.json();
      libraryElm = elmJson;
      library = new Library(libraryElm);
      processedLibraries[libraryName] = library;
    } else if (cqlContent) {
      // Call the /cql/translator service here to convert CQL to ELM
      libraryElm = await fetchAndTranslateExternalCQLLibraryToElm(
        cqlContent.url
      );
      library = new Library(libraryElm);
      processedLibraries[libraryName] = library;
    }
  }

  if (library) {
    const executor = new Executor(library),
      ps = new PatientSource(patientSource),
      result: Results = await executor.exec(ps);
    return { result, elm: libraryElm };
  }
  return {
    result: null,
    elm: libraryElm || {},
  };
}

// Helper functions

/**
 * Parse items with reference to external CQL library
 * @param items Items in the questionnaire
 * @returns Items with reference to external CQL library
 */
const filterItemsWithExternalLibReference = (items: FormItems) => {
  return items?.filter((item) =>
    item.extension?.some(
      (ext) =>
        CALCULATABLE_EXPRESSION_URLS.includes(ext.url) &&
        ext.valueExpression?.reference
    )
  );
};

/**
 * From a list of questionnaire items, return the items that contain inline expressions
 * @param items Items in the questionnaire
 * @returns Questionnaire items with inline expressions
 */
const getCalculatableItemsWithInlineExpressions = (items: FormItems) => {
  return items?.filter((item) =>
    item.extension?.some(
      (ext) =>
        CALCULATABLE_EXPRESSION_URLS.includes(ext.url) &&
        ext.valueExpression?.expression
    )
  );
};

/**
 * Fetch and translate external CQL library to ELM
 * @param url URL of the external CQL library
 * @returns ELM representation of the external CQL library
 */
const fetchAndTranslateExternalCQLLibraryToElm = async (url: string) => {
  const externalLibrary = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/cql",
      Accept: "application/elm+json",
    },
  });
  const externalLibraryText = await externalLibrary.text();

  const response = await fetch(
    `${import.meta.env.VITE_TRANSLATOR_BASE_URL}/cql/translator`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/cql",
        Accept: "application/elm+json",
      },
      body: externalLibraryText,
    }
  );
  return await response.json();
};

/**
 * Fetch external library resource
 * @param url URL of the external library resource
 * @returns External library resource as JSON
 */
const fetchExternalLibraryResource = async (url: string) => {
  const response = await fetch(url);
  return await response.json();
};

/**
 * Get items from the questionnaire data
 * @param questionnaireData The FHIR questionnaire JSON object
 * @returns Items in the questionnaire
 */
function getQuestionnaireItems(
  questionnaireData: Record<string, unknown>
): FormItems {
  return questionnaireData["item"] as FormItems;
}

function isEmpty<T>(items: Array<T>): boolean {
  return !items || items.length === 0;
}

/**
 * This function retrieves the extension objects from the questionnaire data.
 * @param questionnaireData The FHIR questionnaire JSON object
 * @returns An array of extension objects from the questionnaire data
 */
function getQuestionnaireExtensions(
  questionnaireData: Record<string, unknown>
): Array<Record<string, unknown>> {
  return questionnaireData["extension"] as Array<Record<string, unknown>>;
}

/**
 * This function checks if the extension object has a valueExpression property with a reference property.
 * @param extension An object that contains a valueExpression property.
 * @returns A boolean that represents if the extension object has a valueExpression with a reference property.
 */
function hasValueExpressionReference(
  extension: Record<string, unknown>
): boolean {
  return !!(
    extension["valueExpression"] &&
    (extension["valueExpression"] as Record<string, unknown>)["reference"]
  );
}

/**
 * This function retrieves the reference from the valueExpression of the extension object.
 * @param extension An object that contains a valueExpression property.
 * @returns A string that represents the reference from the valueExpression.
 */
function getValueExpressionReference(
  extension: Record<string, unknown>
): string {
  return (extension["valueExpression"] as Record<string, unknown>)[
    "reference"
  ] as string;
}

/**
 * Parses a reference string in the format "libraryName.functionName"
 * @param reference A reference string in the format "libraryName.functionName"
 * @returns An array with the library name and function name
 */
function parseReference(reference: string): [string, string] {
  return reference.replace(/"/g, "").split(".") as [string, string];
}

function getExternalCqlLibraries(
  extensions: Array<Record<string, unknown>>
): CQFLibrary[] {
  return extensions
    ? extensions
        .filter(
          (ext: Record<string, unknown>) =>
            ext.url === "http://hl7.org/fhir/StructureDefinition/cqf-library"
        )
        .map((ext: unknown) => ext as CQFLibrary)
    : [];
}

function isNotEmpty(elm: Record<string, unknown>): boolean {
  return Object.keys(elm).length !== 0;
}

function hasUnfilteredResult(result: Results, functionName: string): boolean {
  return result && result.unfilteredResults[functionName];
}

function hasValueExpression(extension: Record<string, unknown>): boolean {
  return !!(
    extension["valueExpression"] &&
    (extension["valueExpression"] as Record<string, unknown>)["expression"]
  );
}

function getValueExpression(extension: Record<string, unknown>): string {
  return (extension["valueExpression"] as Record<string, unknown>)[
    "expression"
  ] as string;
}

async function fetchAndTranslateCqlToElm(
  wrappedExpression: string
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `${import.meta.env.VITE_TRANSLATOR_BASE_URL}/cql/translator`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/cql",
        Accept: "application/elm+json",
      },
      body: wrappedExpression,
    }
  );
  return await response.json();
}

function getUnfilteredResult(result: Results, functionName: string): unknown {
  return result.unfilteredResults[functionName];
}

/**
 * For inline expressions, the main result is stored in the "__lforms__main__" key.
 * Fetches the main result from the unfiltered results.
 * @param result
 * @returns
 */
function getUnfilteredMainResult(result: Results): unknown {
  return result.unfilteredResults["__lforms__main__"];
}

/**
 * Parses a questionnaire and runs any CQL expressions found in it. Handles both external CQL libraries and inline CQL expressions.
 * @param fhirQuestionnaire The FHIR questionnaire JSON object
 * @returns An object with the ELM data and the CQL execution result
 */
export async function parseQuestionnaireAndRunCQL(
  fhirQuestionnaire: Record<string, unknown>
): Promise<{
  elmData: Record<string, unknown>;
  cqlExecutionResult: Record<string, unknown> | null;
}> {
  const items = getQuestionnaireItems(fhirQuestionnaire);
  const itemsWithReferenceToExternalLib =
    filterItemsWithExternalLibReference(items);
  const itemsWithInlineCQL = getCalculatableItemsWithInlineExpressions(items);

  if (isEmpty(itemsWithReferenceToExternalLib) && isEmpty(itemsWithInlineCQL)) {
    return { elmData: {}, cqlExecutionResult: null };
  }

  const extensions = getQuestionnaireExtensions(fhirQuestionnaire);
  const processedLibraries: Record<string, Library> = {};
  const elmData: Record<string, unknown> = {};
  let cqlExecutionResult: Record<string, unknown> | null = null;

  for (const itemWithReference of itemsWithReferenceToExternalLib) {
    for (const extension of itemWithReference["extension"]) {
      if (hasValueExpressionReference(extension)) {
        const reference = getValueExpressionReference(extension);
        const [libraryName, functionName] = parseReference(reference);

        const externalCqlLibraries = getExternalCqlLibraries(extensions);

        if (!externalCqlLibraries) {
          alert("External CQL library not found in the questionnaire");
          return {
            elmData: {},
            cqlExecutionResult: null,
          };
        }

        try {
          const { result, elm } = await executeCQLLib({
            processedLibraries,
            externalCqlLibraries,
          });

          if (isNotEmpty(elm)) {
            elmData[libraryName] = elm;
          }

          if (result) {
            if (hasUnfilteredResult(result, functionName)) {
              cqlExecutionResult = {
                ...(cqlExecutionResult || {}),
                [functionName]: getUnfilteredResult(result, functionName),
              };
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  for (const itemWithInlineCQL of itemsWithInlineCQL) {
    for (const extension of itemWithInlineCQL["extension"]) {
      if (hasValueExpression(extension)) {
        const expression = getValueExpression(extension);
        const wrappedExpression = wrapExpressionInFunction(expression);
        try {
          const data = await fetchAndTranslateCqlToElm(wrappedExpression);
          elmData[expression] = data;

          const lib = new Library(data);
          const executor = new Executor(lib);
          const psource = new PatientSource([]);

          const result: Results = await executor.exec(psource);
          cqlExecutionResult = {
            ...(cqlExecutionResult || {}),
            [expression]: getUnfilteredMainResult(result),
          };
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  return { elmData, cqlExecutionResult };
}

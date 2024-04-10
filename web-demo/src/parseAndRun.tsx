import { Results, Library, Executor, PatientSource } from "cql-execution";

const EXPRESSION_URLS = [
  "http://hl7.org/fhir/StructureDefinition/variable",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-candidateExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-contextExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression",
  "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression",
];
/**
 * Parse items with reference to external CQL library
 * @param items Items in the questionnaire
 * @returns Items with reference to external CQL library
 */
const getItemsWithReferenceToExternalLib = (
  items: Array<{
    extension: Array<{
      url: string;
      valueExpression: {
        description: string;
        language: string;
        reference: string;
      };
    }>;
  }>
) => {
  return items?.filter((item) =>
    item.extension?.some(
      (ext) =>
        EXPRESSION_URLS.includes(ext.url) && ext.valueExpression?.reference
    )
  );
};
// Function to fetch external library
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
const fetchExternalLibraryResource = async (url: string) => {
  const response = await fetch(url);
  return await response.json();
};
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
export async function parseAndRun(
  questionnaireData: Record<string, unknown>
): Promise<{
  elmData: Record<string, unknown>;
  cqlExecutionResult: Record<string, unknown> | null;
}> {
  // Get questionnaire items
  const items = questionnaireData["item"] as Array<{
    extension: Array<{
      url: string;
      valueExpression: {
        description: string;
        language: string;
        reference: string;
      };
    }>;
  }>;
  // Filter to just the items with a reference to an external CQL library
  const itemsWithReference = getItemsWithReferenceToExternalLib(items);
  if (!itemsWithReference || itemsWithReference.length === 0) {
    alert(
      "Items with reference to external CQL library not found in the questionnaire"
    );
    return { elmData: {}, cqlExecutionResult: null };
  }

  const extensions = questionnaireData["extension"] as Array<
    Record<string, unknown>
  >;

  const processedLibraries: Record<string, Library> = {};
  const elmData: Record<string, unknown> = {};
  let cqlExecutionResult: Record<string, unknown> | null = null;

  // Loop through items with reference
  for (const itemWithReference of itemsWithReference) {
    for (const extension of itemWithReference["extension"]) {
      if (
        extension["valueExpression"] &&
        extension["valueExpression"]["reference"]
      ) {
        const reference = extension["valueExpression"]["reference"];
        const [libraryName, functionName] = reference
          .replace(/"/g, "")
          .split(".");

        const externalCqlLibraries: CQFLibrary[] = extensions
          ? extensions
              .filter(
                (ext: Record<string, unknown>) =>
                  ext.url ===
                  "http://hl7.org/fhir/StructureDefinition/cqf-library"
              )
              .map((ext: unknown) => ext as CQFLibrary)
          : [];

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

          if (Object.keys(elm).length !== 0) {
            elmData[libraryName] = elm;
          }

          if (result && result.unfilteredResults[functionName]) {
            cqlExecutionResult = {
              ...(cqlExecutionResult || {}),
              [functionName]: result.unfilteredResults[functionName],
            };
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  return { elmData, cqlExecutionResult };
}

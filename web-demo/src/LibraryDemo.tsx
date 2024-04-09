import { useCallback, useState } from "react";
import questionnaireExample from "./cql_library_questionnaire.json";
import { Results, Library, Executor, PatientSource } from "cql-execution";
import { NavBar } from "./NavBar";

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
 * Parse items with reference to external CQL library if url is calculatedExpression
 *
 * This is overly simplistic, real world use cases will need to handle more than only calculatedExpression's
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
  const externalLibrary = await fetch(url);
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

// Function to execute CQL and handle caching
async function executeCqlAndHandleCaching(
  libraryName: string,
  processedLibraries: Record<string, Library>,
  externalCqlLibrary: Record<string, unknown>
): Promise<{
  result: Results | null;
  elm: Record<string, unknown>;
}> {
  let library: Library | undefined;
  let elmResult: Record<string, unknown> = {};
  if (processedLibraries[libraryName]) {
    library = processedLibraries[libraryName];
  } else {
    const translatedElm = await fetchAndTranslateExternalCQLLibraryToElm(
      externalCqlLibrary["valueString"] as string
    );
    if (translatedElm && Object.keys(translatedElm).length !== 0) {
      elmResult = translatedElm;
      library = new Library(translatedElm);
      processedLibraries[libraryName] = library;
    }
  }

  if (library) {
    const executor = new Executor(library);
    const patientSource = new PatientSource([]);
    const result: Results = await executor.exec(patientSource);
    return { result, elm: elmResult };
  }
  return {
    result: null,
    elm: elmResult || {},
  };
}

const parseAndRun = async (
  questionnaireData: Record<string, unknown>
): Promise<{
  elmData: Record<string, unknown>;
  cqlExecutionResult: Record<string, unknown> | null;
}> => {
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

        const externalCqlLibrary = extensions?.find(
          (ext: Record<string, unknown>) => ext["name"] === libraryName
        );
        if (!externalCqlLibrary) {
          alert("External CQL library not found in the questionnaire");
          return {
            elmData: {},
            cqlExecutionResult: null,
          };
        }

        try {
          const { result, elm } = await executeCqlAndHandleCaching(
            libraryName,
            processedLibraries,
            externalCqlLibrary
          );

          if (Object.keys(elm).length !== 0) {
            elmData[libraryName] = elm;
          }

          console.log(result);

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
};

function LibraryDemo() {
  const [questionnaireData] =
    useState<Record<string, unknown>>(questionnaireExample);
  const [elmData, setElmData] = useState<Record<string, unknown>>({});
  const [cqlExecutionResult, setCqlExecutionResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoadingStatus(true);
      const { elmData, cqlExecutionResult } =
        await parseAndRun(questionnaireData);
      setElmData(elmData);
      setCqlExecutionResult(cqlExecutionResult);
      setLoadingStatus(false);
    },
    [questionnaireData]
  );

  return (
    <>
      <NavBar />
      <h1>Running CQL in the browser demo</h1>
      <section>
        <h2>Example questionnaire:</h2>
        <pre>{JSON.stringify(questionnaireData, null, 2)}</pre>
      </section>
      <div>
        <form
          onSubmit={handleFormSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              width: "100%",
              margin: "auto",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "10px",
                fontSize: "1em",
                backgroundColor: loadingStatus ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "50%",
                transition: "background-color 1s ease",
              }}
              disabled={loadingStatus}
            >
              {loadingStatus ? "Loading" : "Parse Questionnaire and Run CQL"}
            </button>
            <button
              onClick={() => {
                setElmData({});
                setCqlExecutionResult(null);
              }}
              type="reset"
              style={{
                padding: "10px",
                fontSize: "1em",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "50%",
                marginLeft: "10px",
              }}
            >
              Reset
            </button>
          </div>
        </form>
        <section>
          <details>
            <summary>Library ELM transformation</summary>
            <h2>Library ELM transformation</h2>
            <p style={{ color: "#333" }}>
              (depends on{" "}
              <a href="https://github.com/cqframework/cql-translation-service">
                cql-to-elm translation service
              </a>
              )
            </p>

            <pre
              style={{
                textAlign: "left",
                maxWidth: "100%",
                maxHeight: "350px",
                overflowX: "auto",
                overflowY: "auto",
                border: "1px solid #ccc",
              }}
            >
              {Object.entries(elmData).map(([key, value]) => (
                <div key={key}>
                  <mark>{key}:</mark> {JSON.stringify(value, null, 2)}
                </div>
              ))}
            </pre>
          </details>
        </section>
        <section>
          <h2>Form executed CQL output</h2>
          <p>
            (using{" "}
            <a href="https://github.com/cqframework/cql-execution?tab=readme-ov-file">
              cql-execution
            </a>{" "}
            library)
          </p>
          <table
            style={{
              maxWidth: "100%",
              overflowX: "auto",
              border: "1px solid #ccc",
            }}
          >
            {cqlExecutionResult !== null ? (
              Object.entries(cqlExecutionResult).map(([key, value]) => (
                <tr key={key}>
                  <td>
                    <strong>{key}:</strong>
                  </td>
                  <td>{JSON.stringify(value, null, 2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td>Enter a CQL expression above to see the result here.</td>
              </tr>
            )}
          </table>
        </section>
      </div>
    </>
  );
}

export default LibraryDemo;

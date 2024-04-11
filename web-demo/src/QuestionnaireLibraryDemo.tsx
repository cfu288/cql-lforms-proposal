import { useCallback, useMemo, useState } from "react";

import questionnaireExample from "./cql_library_questionnaire.json";
import { NavBar } from "./NavBar";
import { parseAndRun } from "./parseAndRun";

function QuestionnaireLibraryDemo() {
  const [questionnaireData, setQuestionnaireData] =
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
    []
  );

  const qd = JSON.stringify(questionnaireData, null, 2);
  // memoize the questionnaire data to prevent re-rendering
  // Enables flash animation whenever the questionnaire data changes
  // and only re-renders when the questionnaire data changes
  const memoedQuestionnareData = useMemo(
    () => (
      <code>
        <pre
          key={Math.random()}
          style={{
            textAlign: "left",
            maxWidth: "100%",
            maxHeight: "500px",
            overflowX: "auto",
            overflowY: "auto",
            border: "1px solid #ccc",
            fontSize: "small",
            backgroundColor: "var(--accent-bg)",
            animation: "flash 0.75s",
          }}
        >
          {qd}
        </pre>
      </code>
    ),
    [qd]
  );

  return (
    <>
      <NavBar />
      <h1>FHIR Questionnaire CQL *library* in browser execution demo</h1>
      <p>
        This demo parses a FHIR Questionnaire with a CQL library reference and
        executes the referenced CQL methods in the questionnaire from the
        external library in the browser. If the external CQL library contains
        only CQL, the translation to ELM is handled by a hosted{" "}
        <a href="https://github.com/cfu288/cql-translation-service">
          cql-to-elm translation service
        </a>{" "}
        . If the external CQL library contains both CQL and ELM, the ELM is
        directly used for execution.
      </p>
      <section>
        <p>Current questionnaire with CQL Library Reference:</p>
        {memoedQuestionnareData}
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
          <p>
            Current referenced CQL library in the questionaire below contains{" "}
            {(questionnaireData.extension as any[])[0].valueCanonical.includes(
              "cql+elm-library.json"
            )
              ? "both CQL and ELM"
              : "only CQL. This means a translation service will be used to convert the CQL to ELM before execution"}
            . Click the blue button below to toggle to a{" "}
            {(questionnaireData.extension as any[])[0].valueCanonical.includes(
              "cql+elm-library.json"
            )
              ? "CQL only library"
              : "CQL+ELM library"}{" "}
            . Current library reference:{" "}
            <a href={(questionnaireData.extension as any[])[0].valueCanonical}>
              {(questionnaireData.extension as any[])[0].valueCanonical}
            </a>
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const newQuestionnaireData = JSON.parse(
                JSON.stringify(questionnaireData)
              );
              // toggle between cql-library.json and cql+elm-library.json dynamically by checking the current value
              const url = new URL(
                newQuestionnaireData.extension[0].valueCanonical
              );
              const path = url.pathname;
              const base = url.origin;
              newQuestionnaireData.extension[0].valueCanonical =
                path === "/cql-lforms-proposal/cql+elm-library.json"
                  ? base + "/cql-lforms-proposal/cql-library.json"
                  : base + "/cql-lforms-proposal/cql+elm-library.json";

              setElmData({});
              setCqlExecutionResult(null);
              setQuestionnaireData(newQuestionnaireData);
            }}
          >
            {(questionnaireData.extension as any[])[0].valueCanonical.includes(
              "cql+elm-library.json"
            )
              ? "Switch to a CQL only library"
              : "Switch to a CQL+ELM library"}
          </button>
        </form>
      </section>
      {Object.entries(elmData).length > 0 && (
        <section>
          <details>
            <summary>Library ELM Representation</summary>
            <p>
              (If only a CQL representation is provided in the library,
              conversion depends on a{" "}
              <a href="https://github.com/cqframework/cql-translation-service">
                cql-to-elm translation service
              </a>{" "}
              to handle the translation to ELM )
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
      )}
      {cqlExecutionResult && (
        <>
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
        </>
      )}
    </>
  );
}

export default QuestionnaireLibraryDemo;

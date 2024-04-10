import { useCallback, useState } from "react";
import questionnaireExample from "./cql_library_questionnaire.json";
import { NavBar } from "./NavBar";
import { parseAndRun } from "./parseAndRun";

function LibraryDemo() {
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
    [questionnaireData]
  );

  return (
    <>
      <NavBar />
      <h1>Running CQL in the browser demo</h1>
      <section>
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
          <button
            onClick={() => {
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
            Toggle whether external CQL library contains only CQL or both
            CQL+ELM
          </button>
          <p>
            Current referenced CQL library in the questionaire below contains{" "}
            {(questionnaireData.extension as any[])[0].valueCanonical.includes(
              "cql+elm-library.json"
            )
              ? "both CQL and ELM"
              : "only CQL"}
            . Click the blue button above to toggle.
          </p>
          <a href={(questionnaireData.extension as any[])[0].valueCanonical}>
            Ref: {(questionnaireData.extension as any[])[0].valueCanonical}
          </a>
        </form>
        <p>Example questionnaire with CQL Library Reference:</p>
        <pre
          style={{
            textAlign: "left",
            maxWidth: "100%",
            maxHeight: "500px",
            overflowX: "auto",
            overflowY: "auto",
            border: "1px solid #ccc",
            fontSize: "small",
          }}
        >
          {JSON.stringify(questionnaireData, null, 2)}
        </pre>
      </section>
      {Object.entries(elmData).length > 0 && (
        <section>
          <details>
            <summary>Library ELM transformation</summary>
            <h2>Library ELM transformation</h2>
            <p>
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

export default LibraryDemo;

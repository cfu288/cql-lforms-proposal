import { useCallback, useMemo, useState } from "react";

import questionnaireExample from "./cql_expression_questionnaire.json";
import { NavBar } from "./NavBar";
import { parseQuestionnaireAndRunCQL } from "./parseQuestionnaireAndRunCQL";

function QuestionnaireExpressionDemo() {
  const [questionnaireData, _] =
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
        await parseQuestionnaireAndRunCQL(questionnaireData);
      setElmData(elmData);
      setCqlExecutionResult(cqlExecutionResult);
      setLoadingStatus(false);
    },
    [questionnaireData]
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
      <h1>FHIR Questionnaire *inline* CQL in browser execution demo</h1>
      <p>
        This demo parses a FHIR Questionnaire with an inline CQL expression and
        executes the referenced CQL expression from the questionnaire in the
        browser.
      </p>
      <p>
        Note that the reference{" "}
        <a href="https://github.com/cfu288/cql-translation-service">
          cql-to-elm translation service
        </a>{" "}
        does not handle the translation to ELM for inline CQL expressions. As a
        workaround, the CQL expression is converted to a library by wrapping the
        CQL expression with a function <code>__lforms__main__</code> and
        executing that function.
      </p>
      <p>
        This does mean that providing an alternate Elm representation of the CQL
        via a us-ph-alternative-expression-extension is not currently possible.
        This demo will not attempt to use a
        us-ph-alternative-expression-extension elm+json representation if it
        exists and will always use the CQL expression with above workaround.
      </p>
      <section>
        <p>Current questionnaire with CQL inline expressions:</p>
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

export default QuestionnaireExpressionDemo;

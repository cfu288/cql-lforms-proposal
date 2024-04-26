import { useCallback, useMemo, useState } from "react";

import questionnaireExample from "../cql_expression_questionnaire.json";
import { NavBar } from "../components/NavBar";
import { parseQuestionnaireAndRunCQL } from "../cql-handling/parseQuestionnaireAndRunCQL";

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
    ),
    [qd]
  );

  return (
    <body className="hack container">
      <NavBar />
      <h1>FHIR Questionnaire with execution of *inline* CQL in browser demo</h1>
      <p>
        This demo parses a FHIR Questionnaire with an inline CQL expression and
        executes the referenced CQL expression from the questionnaire in the
        browser.
      </p>
      <p>
        Note that this demo depends on the reference{" "}
        <a href="https://github.com/cfu288/cql-translation-service">
          cql-to-elm translation service
        </a>{" "}
        , which actually cannot handle the translation to ELM for inline CQL
        expressions as it only works with libraries. As a workaround, we take
        the user provided inline CQL expression, converted it to a library by
        wrapping the CQL expression with a function{" "}
        <code>__lforms__main__</code>, and executing that function.
      </p>
      <p>
        This does mean that providing an alternate EELM representation of the
        CQL via a us-ph-alternative-expression-extension in the questionnaire is
        not currently possible. Even if it was possible,{" "}
        <a href="https://hl7.org/fhir/us/ecr/STU2.1/StructureDefinition-us-ph-alternative-expression-extension.html">
          the current Context of Use in the IG
        </a>{" "}
        does not include questionnaires.
      </p>
      <section>
        <h2>Demo questionnaire with CQL inline expressions to be executed:</h2>
        <p>
          Click the buttons below the questionnaire to execute the inline CQL
        </p>
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
            <button type="submit" style={{}} disabled={loadingStatus}>
              {loadingStatus ? "Loading" : "Parse Questionnaire and Run CQL"}
            </button>
            <button
              onClick={() => {
                setElmData({});
                setCqlExecutionResult(null);
              }}
              type="reset"
            >
              Reset
            </button>
          </div>
        </form>
      </section>
      {Object.entries(elmData).length > 0 && (
        <section>
          <h1>Execution Details</h1>
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
            <h1>Form executed CQL output</h1>
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
    </body>
  );
}

export default QuestionnaireExpressionDemo;

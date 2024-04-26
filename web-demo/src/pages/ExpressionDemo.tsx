import { Executor, Library, PatientSource, Results } from "cql-execution";
import { useCallback, useEffect, useState } from "react";

import { NavBar } from "../components/NavBar";
import { wrapExpressionInFunction } from "../utils/wrapExpressionInFunction";

function ExpressionDemo() {
  const [input, setInput] = useState("");
  const [elm, setElm] = useState<Record<string, unknown>>({});
  const [cqlResult, setCqlResult] = useState<Results | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_TRANSLATOR_BASE_URL}/cql/translator`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/cql",
              Accept: "application/elm+json",
            },
            body: wrapExpressionInFunction(input),
            // body: input,
          }
        );
        const data = await response.json();
        setElm(data);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    },
    [input, setElm, setIsLoading]
  );

  useEffect(() => {
    if (Object.keys(elm).length !== 0) {
      const lib = new Library(elm);
      const executor = new Executor(lib);
      const psource = new PatientSource([]);

      executor
        .exec(psource)
        .then((result: Results) => {
          setCqlResult(result.unfilteredResults["__lforms__main__"]);
        })
        .catch((err) => {
          alert(err);
        });
    }
  }, [elm]);

  return (
    <body className="hack container">
      <NavBar />
      <h1>Inline CQL in the browser demo</h1>
      <p>
        This demo takes a user-entered CQL expression, converts it to ELM using
        a hosted{" "}
        <a href="https://github.com/cfu288/cql-translation-service">
          cql-to-elm translation service
        </a>{" "}
        , and executes the ELM using the{" "}
        <a href="https://github.com/cqframework/cql-execution?tab=readme-ov-file">
          cql-execution
        </a>{" "}
        library in the browser.
      </p>

      <div>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <label
            htmlFor="cql"
            style={{ fontSize: "1.2em", fontWeight: "bold" }}
          >
            Enter CQL expression (e.g., <code>Now()</code> or <code>2*3</code>{" "}
            ):
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter CQL expression"
            style={{ padding: "10px", fontSize: "1em" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              width: "100%",
              margin: "auto",
            }}
          >
            <button type="submit" style={{}} disabled={isLoading}>
              {isLoading ? "Loading" : "Run"}
            </button>
            <button
              onClick={() => {
                setInput("");
                setElm({});
                setCqlResult(null);
              }}
              type="reset"
              style={{}}
            >
              Reset
            </button>
          </div>
        </form>
        {cqlResult && (
          <section>
            <h1>Execution details</h1>
            {Object.entries(elm).length > 0 && (
              <>
                <p>
                  <mark>Note:</mark> Since the{" "}
                  <a href="https://github.com/cfu288/cql-translation-service">
                    cql-to-elm translation service
                  </a>{" "}
                  does not accept single line CQL expressions, the user entered
                  expression will be wrapped into a function before translation.
                </p>
                <details>
                  <summary>1) Wrapping CQL expression</summary>
                  Prior to translation of CQL to elm, the user-entered CQL
                  expression is wrapped in a function definition:
                  <pre>
                    define __lforms__main__:
                    <br />
                    &nbsp;&nbsp;{input || "<Enter CQL Expression>"}
                  </pre>
                  In step 3, we will need to extract the result from the{" "}
                  <code>__lforms__main__</code> executed function.
                </details>
                <details>
                  <summary>2) CQL to ELM transformation</summary>
                  <p>
                    The above wrapped expression is sent to an external{" "}
                    <a href="https://github.com/cqframework/cql-translation-service">
                      cql-to-elm translation service
                    </a>
                    . The response below is the ELM representation of the CQL
                    function we created in step 1.
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
                    {elm !== null ? (
                      <code>{JSON.stringify(elm, null, 2)}</code>
                    ) : (
                      "Enter a CQL expression above to see the result here."
                    )}
                  </pre>
                </details>
              </>
            )}
            <details>
              <summary>3) CQL execution</summary>
              <p>
                We then take the above ELM from step 2 and pass it to the{" "}
                <a href="https://github.com/cqframework/cql-execution?tab=readme-ov-file">
                  cql-execution
                </a>{" "}
                library to execute. Since we wrapped the user-entered CQL in a
                function, the result is extracted result of the{" "}
                <code>__lforms__main__</code> function execution.
                <code>
                  <pre>
                    {`const lib = new Library(elm);
const executor = new Executor(lib);
const psource = new PatientSource([]);

executor
  .exec(psource)
  .then((result: Results) => {
    // Result here is the result of the user-entered CQL expression
    console.log(result.unfilteredResults["__lforms__main__"]);
  })
  .catch((err) => {
    alert(err);
  });`}
                  </pre>
                </code>
              </p>
            </details>
          </section>
        )}

        <h1>Result:</h1>
        <table style={{ width: "100%", border: "1px solid #ccc" }}>
          <thead>
            <tr>
              <th>Expression</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ overflowX: "auto" }}>
                {input ? input : "Enter a CQL expression above."}
              </td>
              <td style={{ overflowX: "auto" }}>
                {cqlResult !== null ? (
                  <code>{JSON.stringify(cqlResult, null, 2)}</code>
                ) : input ? (
                  "Click run to see the result here"
                ) : (
                  "Enter a CQL expression above."
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  );
}

export default ExpressionDemo;

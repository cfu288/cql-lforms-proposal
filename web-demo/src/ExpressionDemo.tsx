import { useCallback, useState, useEffect } from "react";
import { Executor, Library, PatientSource, Results } from "cql-execution";
import { NavBar } from "./NavBar";

/**
 * The translation service does not accept CQL expressions directly. We can wrap the CQL expression in a function to execute.
 * @param expression The CQL expression to be wrapped in a function
 * @returns The CQL expression wrapped in a function as a string
 */
const wrapExpressionInFunction = (expression: string): string => {
  return `define __lforms__main__:\n  ${expression}`;
};

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

      (async () => {
        try {
          const result: Results = await executor.exec(psource);
          setCqlResult(result.unfilteredResults["__lforms__main__"]);
        } catch (err) {
          alert(err);
        }
      })();
    }
  }, [elm]);

  return (
    <>
      <NavBar />
      <h1>Running CQL in the browser demo</h1>
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
            Enter CQL expression (e.g., Now() or 2*3 ):
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
            <button
              type="submit"
              style={{
                padding: "10px",
                fontSize: "1em",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "50%",
              }}
            >
              Run
            </button>
            <button
              onClick={() => {
                setInput("");
                setElm({});
                setCqlResult(null);
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
          <p style={{ textAlign: "center", color: "#f44336" }}>
            {isLoading && "Loading"}
          </p>
        </form>
        <h2>
          ELM output (depends on{" "}
          <a href="https://github.com/cqframework/cql-translation-service">
            cql-to-elm translation service
          </a>
          )
        </h2>
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
          {JSON.stringify(elm, null, 2)}
        </pre>
        <h2>
          CQL output (using{" "}
          <a href="https://github.com/cqframework/cql-execution?tab=readme-ov-file">
            cql-execution
          </a>{" "}
          library)
        </h2>
        <pre
          style={{
            maxWidth: "100%",
            overflowX: "auto",
            border: "1px solid #ccc",
          }}
        >
          {cqlResult !== null
            ? JSON.stringify(cqlResult, null, 2)
            : "Enter a CQL expression above to see the result here."}
        </pre>
      </div>
    </>
  );
}

export default ExpressionDemo;

import { useCallback, useState, useEffect } from "react";
import cql, { Results } from "cql-execution";

const wrapExpressionInFunction = (expression: string) => {
  return `define __lforms__main__:\n  ${expression}`;
};

function App() {
  const [input, setInput] = useState("");
  const [elm, setElm] = useState<Record<string, unknown>>({});
  const [cqlResult, setCqlResult] = useState<Results | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      fetch("http://localhost:8080/cql/translator", {
        method: "POST",
        headers: {
          "Content-Type": "application/cql",
          Accept: "application/elm+json",
        },
        body: wrapExpressionInFunction(input),
      })
        .then((response) => response.json())
        .then((data) => setElm(data));
    },
    [input]
  );

  useEffect(() => {
    if (Object.keys(elm).length !== 0) {
      const lib = new cql.Library(elm);
      const executor = new cql.Executor(lib);
      const psource = new cql.PatientSource([]);

      (async () => {
        try {
          const result: Results = await executor.exec(psource);
          setCqlResult(result.unfilteredResults["__lforms__main__"]);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [elm]);

  return (
    <>
      <h1>Running CQL in the browser demo</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="cql">
            Enter CQL expression (e.g., Now() or 2*3 ):
          </label>
          <div style={{ width: "100%" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter CQL expression"
            />
            <button type="submit">Run</button>
            <button
              onClick={() => {
                setInput("");
                setElm({});
                setCqlResult(null);
              }}
              type="reset"
            >
              {" "}
              Reset
            </button>
          </div>
        </form>
        <h2>ELM outpu (depends on cql-to-elm translation hosted service)t</h2>
        <pre
          style={{
            textAlign: "left",
            maxWidth: "100%",
            maxHeight: "500px",
            overflowX: "auto",
            overflowY: "auto",
            border: "1px solid #ccc",
          }}
        >
          {JSON.stringify(elm, null, 2)}
        </pre>
        <h2>CQL output (using cql-executor library)</h2>
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

export default App;

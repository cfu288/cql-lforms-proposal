import { useCallback, useState } from "react";

import { NavBar } from "../components/NavBar";
import { BadRequestError } from "../components/BadRequestError";

function TranslatorUtility() {
  const [input, setInput] = useState("");
  const [elm, setElm] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
            body: input,
          }
        );
        if (!response.ok) {
          if (response.status === 400) {
            /**
             * {"library":{"annotation":[{"translatorVersion":"3.7.1","translatorOptions":"","signatureLevel":"None","type":"CqlToElmInfo"},{"librarySystem":"/tmp/rep18409197112867463641tmp","libraryId":"rep18409197112867463641tmp","startLine":1,"startChar":0,"endLine":1,"endChar":0,"message":"Syntax error at 2","errorType":"syntax","errorSeverity":"error","type":"CqlToElmError"}],"identifier":{},"schemaIdentifier":{"id":"urn:hl7-org:elm","version":"r1"},"usings":{"def":[{"localIdentifier":"System","uri":"urn:hl7-org:elm-types:r1","annotation":[]}]}}}
             */
            const errorData = await response.json();
            throw new BadRequestError(
              errorData.library.annotation.find(
                (annotation: { type: string }) =>
                  annotation.type === "CqlToElmError"
              ).message
            );
          } else {
            throw new Error("An unexpected error occurred");
          }
        }
        const data = await response.json();
        setElm(data);
        setError("");
      } catch (error) {
        console.error(error);
        if (error instanceof BadRequestError) {
          setError((error as BadRequestError).message);
        } else {
          setError(`There was an error when converting your CQL`);
        }
      }
      setIsLoading(false);
    },
    [input, setElm, setIsLoading]
  );

  return (
    <body className="hack container">
      <NavBar />
      {error && <div className="alert alert-error">{error}</div>}
      <h1>CQL to ELM Translation Utility</h1>
      <p>
        This utility takes CQL code and converts it to ELM using a hosted{" "}
        <a href="https://github.com/cfu288/cql-translation-service">
          cql-to-elm translation service
        </a>{" "}
        hosted at{" "}
        <a href="https://cqltranslationservice.foureighteen.dev/cql/translator">
          https://cqltranslationservice.foureighteen.dev/cql/translator
        </a>
        .
      </p>
      <div>
        <h2>Enter CQL Code to Translate Below</h2>
        <form
          onSubmit={handleSubmit}
          className="form container"
          style={{
            width: "100%",
            marginTop: "24px",
          }}
        >
          <fieldset
            className="form-group form-textarea"
            style={{
              width: "100%",
              display: "flex",
            }}
          >
            <label htmlFor="cql">CQL CODE:</label>
            <textarea
              id="cql"
              rows={10}
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER CQL CODE TO TRANSLATE HERE..."
              style={{ width: "100%" }}
            ></textarea>
          </fieldset>
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
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading"></span> : ""} Translate
            </button>
            <button
              className="btn btn-primary btn-ghost"
              onClick={() => {
                setInput("");
                setElm({});
                setError("");
              }}
              type="reset"
            >
              Reset
            </button>
          </div>
        </form>
        <h1>Result:</h1>
        <pre
          style={{
            textAlign: "left",
            maxWidth: "100%",
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
      </div>
      <a href="https://github.com/cfu288/cql-lforms-proposal/blob/b42c33f3c54afda2c83b09bd2ff1c4fe9d97a3a1/web-demo/src/pages/ExpressionDemo.tsx#L42C1-L53C12">
        View the source code for this demo
      </a>
    </body>
  );
}

export default TranslatorUtility;

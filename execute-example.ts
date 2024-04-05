import cql, { Results } from "cql-execution";
import * as externalLib from "./MockInlineCQLExample/example.json"; // Requires the "resolveJsonModule" compiler option to be "true"

const lib = new cql.Library(externalLib);
const executor = new cql.Executor(lib);
const psource = new cql.PatientSource([]);

(async () => {
  try {
    const result: Results = await executor.exec(psource);
    console.log(result.unfilteredResults["__lforms__main__"]);
  } catch (err) {
    console.error(err);
  }
})();

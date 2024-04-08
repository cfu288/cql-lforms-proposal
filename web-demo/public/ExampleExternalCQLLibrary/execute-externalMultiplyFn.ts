import cql from "cql-execution";
import * as measure from "./ExampleExternalCQLLibrary.json"; // Requires the "resolveJsonModule" compiler option to be "true"

const lib = new cql.Library(measure);
const executor = new cql.Executor(lib);
const psource = new cql.PatientSource([
  // {
  //   id: "1",
  //   recordType: "Patient",
  //   name: "John Smith",
  //   gender: "M",
  //   birthDate: "1980-02-17T06:15",
  // },
  // {
  //   id: "2",
  //   recordType: "Patient",
  //   name: "Sally Smith",
  //   gender: "F",
  //   birthDate: "2007-08-02T11:47",
  // },
]);

executor
  .exec(psource)
  .then((result) => {
    console.log(result.unfilteredResults["externalMultiplyFn"]);
    console.log(JSON.stringify(result, undefined, 2));
  })
  .catch((err) => {
    console.error(err);
  });

function stringifyInput(input: string): string {
  try {
    const parsedInput = input;
    const tmpJson: { result: string } = {
      result: parsedInput,
    };
    const stringify = JSON.stringify(tmpJson);
    return stringify;
  } catch (error) {
    console.error("Invalid input. Please provide a valid JSON string." + error);
    return "";
  }
}

// const inputArg = process.argv[2];
// console.log(stringifyInput(inputArg));
console.log(
  stringifyInput(
    `context Patient

    define "InInitialPopulation":
        AgeInYearsAt(@2013-01-01) >= 16 and AgeInYearsAt(@2013-01-01) < 24
    
    context Unfiltered
    
    define "InitialPopulationCount":
        Count(InInitialPopulation IP where IP is true)
    
    InitialPopulationCount`
  )
);

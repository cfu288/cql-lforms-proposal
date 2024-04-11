/**
 * The translation service does not accept CQL expressions directly. We can wrap the CQL expression in a function to execute.
 * @param expression The CQL expression to be wrapped in a function
 * @returns The CQL expression wrapped in a function as a string
 */
export const wrapExpressionInFunction = (expression: string): string => {
  return `define __lforms__main__:\n  ${expression}`;
};

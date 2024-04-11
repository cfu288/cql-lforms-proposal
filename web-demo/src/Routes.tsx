const base = import.meta.env.DEV ? "/" : "/cql-lforms-proposal/";

export const AppRoutes = {
  home: base,
  expressions: base + "expressions",
  questionnaireInlineExpressions: base + "questionnaire-expressions",
  questionnaireLibraries: base + "questionnaire-libraries",
} as const;

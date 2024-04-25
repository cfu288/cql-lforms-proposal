import { Link } from "react-router-dom";
import { AppRoutes } from "../components/Routes";

export function NavBar() {
  return (
    <header>
      <nav>
        <h1>Links:</h1>
        <ul>
          <li>
            <Link to={AppRoutes.home}>README</Link>
          </li>
          <li>
            <Link to={AppRoutes.expressions}>
              Demo 1: Inline CQL Expression Example with CQL {"->"} Elm
              Conversion
            </Link>
          </li>
          <li>
            <Link to={AppRoutes.questionnaireInlineExpressions}>
              Demo 2: FHIR questionnaire with Inline CQL Example
            </Link>
          </li>
          <li>
            <Link to={AppRoutes.questionnaireLibraries}>
              Demo 3: FHIR questionnaire with CQL Library Example
            </Link>
          </li>
          <li>
            <a href="https://github.com/cfu288/cql-lforms-proposal">GitHub</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

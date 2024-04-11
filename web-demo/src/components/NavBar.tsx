import { Link } from "react-router-dom";
import { AppRoutes } from "../components/Routes";

export function NavBar() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to={AppRoutes.home}>Home</Link>
          </li>
          <li>
            <Link to={AppRoutes.expressions}>
              Inline CQL Expression Example with CQL {"->"} Elm Conversion
            </Link>
          </li>
          <li>
            <Link to={AppRoutes.questionnaireInlineExpressions}>
              FHIR questionnaire with Inline CQL Example
            </Link>
          </li>
          <li>
            <Link to={AppRoutes.questionnaireLibraries}>
              FHIR questionnaire with CQL Library Example
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

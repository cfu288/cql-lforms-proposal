import { Link } from "react-router-dom";

export function NavBar() {
  const base = import.meta.env.DEV ? "/" : "/cql-lforms-proposal/";
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to={`${base}`}>
              Inline CQL Expression Example with CQL {"->"} Elm Conversion
            </Link>
          </li>
          <li>
            <Link to={`${base}libraries`}>
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

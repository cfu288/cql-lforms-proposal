import { Link } from "react-router-dom";

export function NavBar() {
  // const base = import.meta.env.BASE_URL;
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/cql-lforms-proposal/">Expressions</Link>
          </li>
          <li>
            <Link to="/cql-lforms-proposal/libraries">Libraries</Link>
          </li>
          <li>
            <a href="https://github.com/cfu288/cql-lforms-proposal">GitHub</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

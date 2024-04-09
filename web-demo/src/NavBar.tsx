import { Link } from "react-router-dom";

export function NavBar() {
  const base = import.meta.env.BASE_URL;
  console.log(base);
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Expressions</Link>
          </li>
          <li>
            <Link to="/libraries">Libraries</Link>
          </li>
          <li>
            <a href="https://github.com/cfu288/cql-lforms-proposal">GitHub</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

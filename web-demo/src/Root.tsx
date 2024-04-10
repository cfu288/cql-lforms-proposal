// @ts-ignore
import markdown from "../../README.md";
import ReactMarkdown from "react-markdown";
import { NavBar } from "./NavBar.tsx";

export function Root() {
  return (
    <>
      <NavBar />
      <ReactMarkdown children={markdown} />
    </>
  );
}

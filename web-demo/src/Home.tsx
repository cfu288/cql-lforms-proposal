// @ts-ignore
import markdown from "../../README.md";
import ReactMarkdown from "react-markdown";
import { NavBar } from "./NavBar.tsx";

export function Home() {
  return (
    <>
      <NavBar />
      <ReactMarkdown children={markdown} />
    </>
  );
}

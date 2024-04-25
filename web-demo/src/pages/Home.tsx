// @ts-ignore
import markdown from "../../../README.md";
import ReactMarkdown from "react-markdown";
import { NavBar } from "../components/NavBar.tsx";
import rehypeRaw from "rehype-raw";

export function Home() {
  return (
    <>
      <NavBar />
      <ReactMarkdown children={markdown} rehypePlugins={[rehypeRaw]} />
    </>
  );
}

// @ts-ignore
import markdown from "../../../README.md";
import ReactMarkdown from "react-markdown";
import { NavBar } from "../components/NavBar.tsx";
import rehypeRaw from "rehype-raw";

export function Home() {
  return (
    <body className="hack container">
      <NavBar />
      <ReactMarkdown children={markdown} rehypePlugins={[rehypeRaw]} />
    </body>
  );
}

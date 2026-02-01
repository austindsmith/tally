import Home from "@/entrypoints/popup/views/Home";
import Preview from "@/entrypoints/popup/views/Preview";
import Settings from "@/entrypoints/popup/views/Settings";
import { googleSheetUrl } from "#imports";

type ContentProps = {
  view: string;
  onChange: (view: string) => void;
};
export default function Content({ view, onChange }: ContentProps) {
  switch (view) {
    case "home":
      return <Home />;
    case "preview":
      return <Preview></Preview>;
    case "settings":
      return <Settings></Settings>;
    default:
      return <Home />;
  }
}

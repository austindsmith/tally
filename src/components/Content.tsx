import Home from "@/entrypoints/popup/views/Home";
import MasterTable from "@/entrypoints/popup/views/MasterTable";
import Preview from "@/entrypoints/popup/views/Preview";
import Settings from "@/entrypoints/popup/views/Settings";

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
    case "masterTable":
      return <MasterTable></MasterTable>;
    case "settings":
      return <Settings></Settings>;
    default:
      return <Home />;
  }
}

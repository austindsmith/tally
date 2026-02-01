import { useState } from "react";
import "./App.css";
import { googleSheetUrl, sheetData, currentView } from "@/utils/storage";
import { getAuthToken } from "@/utils/auth";
import { useEffect } from "react";
import Dock from "@/components/Dock";
import Content from "@/components/Content";

function App() {
  const [view, setView] = useState<string>("login");
  useEffect(() => {}, []);

  return (
    <>
      <Content view={view} onChange={setView} />
      <Dock view={view} onChange={setView} />
    </>
  );
}
export default App;

import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";
import TextInput from "@/components/TextInput";
import { googleSheetUrl } from "@/utils/storage";
import { googleAuth } from "@/utils/auth";

function App() {
  const [count, setCount] = useState(0);
  const [url, setUrl] = useState("");
  useEffect(() => {
    googleSheetUrl.getValue().then(setUrl);
  }, []);
  async function handleChange(newUrl: string) {
    setUrl(newUrl);
    await googleSheetUrl.setValue(newUrl);
  }
  async function authenticate() {
    googleAuth();
  }

  async function refreshData() {
    await browser.runtime.sendMessage({ type: "FETCH_SHEET" });
    console.log("Data refreshed!");
  }

  return (
    <>
      <div>
        <button onClick={authenticate}>Authenticate</button>
      </div>
      <div className="card">
        <TextInput value={url} onChange={handleChange} />
      </div>
      <div>
        <button onClick={refreshData}>Refresh data</button>
      </div>
    </>
  );
}

export default App;

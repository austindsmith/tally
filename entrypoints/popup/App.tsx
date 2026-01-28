import { useState } from "react";
import "./App.css";
import TextInput from "@/components/TextInput";
import { googleSheetUrl } from "@/utils/storage";
import { getAuthToken } from "@/utils/auth";
import { useEffect } from "react";

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
  async function handleLogin() {
    try {
      const token = await getAuthToken();
      console.log("Authenticated successfully");
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  }

  async function refreshData() {
    await browser.runtime.sendMessage({ type: "FETCH_SHEET" });
    console.log("Data refreshed!");
  }

  return (
    <>
      <div>
        <button onClick={handleLogin}>Authenticate</button>
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

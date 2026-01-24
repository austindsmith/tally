import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";
import TextInput from "@/components/TextInput";
import { googleSheetUrl } from "@/utils/storage";
import { google } from "googleapis";

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

  async function getAndLog() {
    const url = await googleSheetUrl.getValue();
    console.log("URL is:", url);
  }

  return (
    <>
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WXT + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <TextInput value={url} onChange={handleChange} />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div>
        <button onClick={getAndLog}>Click Page Button</button>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;

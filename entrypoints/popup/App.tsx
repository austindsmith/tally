import { useState } from "react";
import "./App.css";
import TextInput from "@/components/TextInput";
import { googleSheetUrl } from "@/utils/storage";
import { getAuthToken } from "@/utils/auth";
import { useEffect } from "react";

type Screen = "login" | "dashboard" | "table";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
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

  if (currentScreen === "login") {
    return (
      <>
        <div>
          <label className="input">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input type="search" className="grow" placeholder="Search" />
            <kbd className="kbd kbd-sm">⌘</kbd>
            <kbd className="kbd kbd-sm">K</kbd>
          </label>
          <button onClick={handleLogin}>Authenticate</button>
        </div>
        <div className="card">
          <TextInput value={url} onChange={handleChange} />
        </div>
        <div>
          <button onClick={refreshData}>Refresh data</button>
        </div>
        <div>
          <button onClick={() => setCurrentScreen("table")}>Table</button>
        </div>
      </>
    );
  }
  if (currentScreen === "table") {
    return (
      <>
        <div className="w-[700px] min-h-[500px]">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Job</th>
                <th>Favorite Color</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              <tr>
                <th>1</th>
                <td>Cy Ganderton</td>
                <td>Quality Control Specialist</td>
                <td>Blue</td>
              </tr>
              {/* row 2 */}
              <tr className="hover:bg-base-300">
                <th>2</th>
                <td>Hart Hagerty</td>
                <td>Desktop Support Technician</td>
                <td>Purple</td>
              </tr>
              {/* row 3 */}
              <tr>
                <th>3</th>
                <td>Brice Swyre</td>
                <td>Tax Accountant</td>
                <td>Red</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <button onClick={() => setCurrentScreen("login")}>Login</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <label className="input">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" className="grow" placeholder="Search" />
          <kbd className="kbd kbd-sm">⌘</kbd>
          <kbd className="kbd kbd-sm">K</kbd>
        </label>
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

import { useState } from "react";
import "./App.css";
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
          <input
            type="text"
            className="input"
            placeholder="Sheet url"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
        <div>
          <button
            className="btn bg-white text-white border-[#e5e5e5]"
            onClick={handleLogin}
          >
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Login with Google
          </button>
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
      <h1>ERROR</h1>
    </>
  );
}

export default App;

import { useState } from "react";
import "./App.css";
import { googleSheetUrl, sheetData } from "@/utils/storage";
import { getAuthToken } from "@/utils/auth";
import { useEffect } from "react";
import Settings from "./views/Settings";

type Screen = "login" | "dashboard" | "table" | "settings";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [url, setUrl] = useState("");
  const [data, setData] = useState([""]);
  useEffect(() => {
    googleSheetUrl.getValue().then(setUrl);
    sheetData.getValue().then(setData);
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
    await browser.runtime.sendMessage({
      type: "FETCH_SHEET",
    });
    console.log(data);
  }

  if (currentScreen === "login") {
    return (
      <>
        <div className="w-96 min-h-80 p-4 bg-base-200">
          <div className="card-body">
            <div className="form-control gap-4 space-y-6">
              <label className="input validator">
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
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </g>
                </svg>
                <input
                  type="text"
                  className="input focus:outline-none"
                  placeholder="Sheet url"
                  value={url}
                  onChange={(e) => handleChange(e.target.value)}
                />
              </label>
              <div>
                <button
                  className="btn bg-white text-black border-[#e5e5e5]"
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
              <div className="flex gap-3">
                <button className="btn btn-success" onClick={refreshData}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  Refresh data
                </button>
              </div>
            </div>
          </div>
          <div className="dock">
            <button className="dock-active">
              <svg
                className="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  fill="currentColor"
                  strokeLinejoin="miter"
                  strokeLinecap="butt"
                >
                  <polyline
                    points="1 11 12 2 23 11"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></polyline>
                  <path
                    d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></path>
                  <line
                    x1="12"
                    y1="22"
                    x2="12"
                    y2="18"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></line>
                </g>
              </svg>
              <span className="dock-label">Home</span>
            </button>

            <button onClick={() => setCurrentScreen("table")}>
              <svg
                className="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  fill="currentColor"
                  strokeLinejoin="miter"
                  strokeLinecap="butt"
                >
                  <polyline
                    points="3 14 9 14 9 17 15 17 15 14 21 14"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></polyline>
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></rect>
                </g>
              </svg>
              <span className="dock-label">Preview</span>
            </button>

            <button>
              <svg
                className="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  fill="currentColor"
                  strokeLinejoin="miter"
                  strokeLinecap="butt"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></circle>
                  <path
                    d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></path>
                </g>
              </svg>
              <span className="dock-label">Settings</span>
            </button>
          </div>
        </div>
      </>
    );
  }
  if (currentScreen === "table") {
    return (
      <>
        <div className="w-96 min-h-80 p-4 card">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                {data.length > 0 &&
                  data[0].map((header, index) => <th key={index}>{header}</th>)}
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
        <div className="dock">
          <button onClick={() => setCurrentScreen("login")}>
            <svg
              className="size-[1.2em]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                fill="currentColor"
                strokeLinejoin="miter"
                strokeLinecap="butt"
              >
                <polyline
                  points="1 11 12 2 23 11"
                  fill="none"
                  stroke="currentColor"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></polyline>
                <path
                  d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></path>
                <line
                  x1="12"
                  y1="22"
                  x2="12"
                  y2="18"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></line>
              </g>
            </svg>
            <span className="dock-label">Home</span>
          </button>

          <button className="dock-active">
            <svg
              className="size-[1.2em]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                fill="currentColor"
                strokeLinejoin="miter"
                strokeLinecap="butt"
              >
                <polyline
                  points="3 14 9 14 9 17 15 17 15 14 21 14"
                  fill="none"
                  stroke="currentColor"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></polyline>
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></rect>
              </g>
            </svg>
            <span className="dock-label">Preview</span>
          </button>

          <button onClick={() => setCurrentScreen("settings")}>
            <svg
              className="size-[1.2em]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                fill="currentColor"
                strokeLinejoin="miter"
                strokeLinecap="butt"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></circle>
                <path
                  d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                ></path>
              </g>
            </svg>
            <span className="dock-label">Settings</span>
          </button>
        </div>
      </>
    );
  }
  if (currentScreen === "settings") {
    return Settings();
  }

  return (
    <>
      <h1>ERROR</h1>
    </>
  );
}

export default App;

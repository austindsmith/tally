import { googleSheetUrl, sheetData, currentView } from "@/utils/storage";
import { google } from "googleapis";
import { getSheetId } from "@/utils/parseUrl";
import { getSheetNames } from "@/utils/googleSheets";

type SettingsProps = {
  url: string;
};

export default function Settings() {
  const [localUrl, setLocalUrl] = useState("");
  const [localSheetData, setLocalSheetData] = useState([""]);

  useEffect(() => {
    googleSheetUrl.getValue().then(setLocalUrl);
    sheetData.getValue().then(setLocalSheetData);
  }, []);

  const localSheetId = getSheetId(localUrl);
  console.log(localSheetId);
  const localSheetNames = getSheetNames(localSheetId);
  const handleChange = async (newUrl: string) => {
    setLocalUrl(newUrl);
    await googleSheetUrl.setValue(newUrl);
  };
  return (
    <div className="w-96 min-h-80 p-4 bg-base-200">
      <div className="card-body">
        <div className="form-control gap-4 space-y-6">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Link</legend>
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
                value={localUrl}
                onChange={(e) => {
                  handleChange(e.target.value);
                }}
              />
            </label>
          </fieldset>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Sheets</legend>
              <select defaultValue="Pick a sheet" className="select">
                <option disabled={true}>Pick a sheet</option>
                <option>{localSheetNames}</option>
                <option>FireFox</option>
                <option>Safari</option>
              </select>
            </fieldset>
          </div>
          <div>
            <button className="btn bg-white text-black border-[#e5e5e5]">
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
        </div>
      </div>
    </div>
  );
}

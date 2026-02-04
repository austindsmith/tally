import { googleSheetUrl, sheetData } from "@/utils/storage";
import { getSheetId } from "@/utils/parseUrl";
import { getSheetNames } from "@/utils/googleSheets";
import { useGoogleSheet } from "@/store/useGoogleSheet";

export default function Settings() {
  const setSheetUrl = useGoogleSheet((state) => state.setSheetUrl);
  const sheetId = useGoogleSheet((state) => state.id);
  const sheetUrl = useGoogleSheet((state) => state.url);
  const sheets = useGoogleSheet((state) => state.sheets);
  const selectedSheet = useGoogleSheet((state) => state.selectedSheet);
  const setSelectedSheet = useGoogleSheet((state) => state.setSelectedSheet);

  const handleSelect = async (sheetName: string) => {
    setSelectedSheet(sheetName);
  };

  useEffect(() => {}, []);

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
                value={sheetUrl}
                onChange={(e) => {
                  setSheetUrl(e.target.value);
                }}
              />
            </label>
          </fieldset>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Sheets</legend>
              <select
                onChange={(e) => {
                  handleSelect(e.target.value);
                }}
                defaultValue="Pick a sheet"
                className="select"
              >
                <option disabled={true}>Pick a sheet</option>
                {sheets.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
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

import { googleSheetUrl, sheetData } from "@/utils/storage";
import { getSheetNames, getSheetId } from "@/utils/googleSheets";
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

  useEffect(() => {
    if (sheetUrl) {
      setSheetUrl(sheetUrl);
    }
    if (selectedSheet) {
      setSelectedSheet(selectedSheet);
    }
  }, [sheetUrl, selectedSheet]);

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
                className="select"
                value={selectedSheet || "Pick a sheet"}
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
        </div>
      </div>
    </div>
  );
}

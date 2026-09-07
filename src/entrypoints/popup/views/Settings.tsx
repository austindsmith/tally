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
  const error = useGoogleSheet((state) => state.error);
  const loading = useGoogleSheet((state) => state.loading);

  const handleSelect = async (sheetName: string) => {
    setSelectedSheet(sheetName);
  };

  useEffect(() => {
    const store = useGoogleSheet.getState();
    if (store.url && !store.sheets.length) {
      store.setSheetUrl(store.url);
    }
  }, []);

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

          {loading && (
            <div className="flex items-center gap-2 text-sm opacity-70">
              <span className="loading loading-spinner loading-sm" />
              Loading sheet…
            </div>
          )}

          {error && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
              </svg>
              <span className="whitespace-pre-wrap break-words text-sm">
                {error}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

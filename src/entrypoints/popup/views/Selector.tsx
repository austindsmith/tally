// Selector.tsx
import { useSelectors } from "@/store/useSelectors";
import { useGoogleSheet } from "@/store/useGoogleSheet";

export default function Selector() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const fields = useSelectors((state) => state.fields);
  const hidden = useSelectors((state) => state.hidden);
  const startPick = useSelectors((state) => state.startPick);
  const setRole = useSelectors((state) => state.setRole);
  const hideColumn = useSelectors((state) => state.hideColumn);
  const showColumn = useSelectors((state) => state.showColumn);
  const checkForPick = useSelectors((state) => state.checkForPick);

  const data = useGoogleSheet((state) => state.data);
  const columns = data[0] ?? [];

  const visibleColumns = columns.filter((col: string) => !hidden.includes(col));
  const hiddenColumns = columns.filter((col: string) => hidden.includes(col));

  const hasMatch = Object.values(fields).some((f) => f?.role === "match");

  useEffect(() => {
    checkForPick();
  }, []);

  return (
    <div className="w-96 h-[500px] p-4 bg-base-200 flex flex-col overflow-y-auto">
      <div className="flex flex-col h-full">
        <h1>Field Mappings</h1>
        <div className="flex-1 p-3 overflow-y-auto max-h-80 space-y-2">
          {visibleColumns.map((column: string) => {
            const isExpanded = expanded === column;
            const field = fields[column];
            const role = field?.role;

            return (
              <div
                key={column}
                className={`bg-base-100 rounded-xl border transition-all ${isExpanded ? "border-primary shadow-sm" : "border-base-300"}`}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : column)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  {role && (
                    <span
                      className={`badge badge-sm ${role === "match" ? "badge-primary" : "badge-secondary"}`}
                    >
                      {role}
                    </span>
                  )}
                  <span className="font-medium flex-1">{column}</span>
                  {field?.preview && (
                    <span className="text-xs opacity-60 truncate max-w-32">
                      {field.preview}
                    </span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 opacity-50 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-base-200">
                    <div className="pt-3 flex gap-2">
                      <button
                        onClick={() => setRole(column, "match")}
                        className={`btn btn-sm flex-1 ${role === "match" ? "btn-primary" : "btn-ghost"}`}
                        disabled={hasMatch && role !== "match"}
                        title={
                          hasMatch && role !== "match"
                            ? "Only one match field allowed"
                            : ""
                        }
                      >
                        Match
                      </button>
                      <button
                        onClick={() => setRole(column, "fill")}
                        className={`btn btn-sm flex-1 ${role === "fill" ? "btn-secondary" : "btn-ghost"}`}
                      >
                        Fill
                      </button>
                    </div>

                    <div>
                      <label className="text-xs opacity-50 uppercase tracking-wide">
                        CSS Selector
                      </label>
                      <div className="mt-1 flex gap-2">
                        <code className="flex-1 text-xs bg-base-200 p-2 rounded font-mono overflow-x-auto">
                          {field?.selector || "None selected"}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startPick(column);
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          Pick
                        </button>
                      </div>
                    </div>

                    {field?.preview && (
                      <div>
                        <label className="text-xs opacity-50 uppercase tracking-wide">
                          Detected Value
                        </label>
                        <div className="mt-1 bg-base-200 p-2 rounded text-sm">
                          {field.preview}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        hideColumn(column);
                        setExpanded(null);
                      }}
                      className="btn btn-ghost btn-xs text-error w-full"
                    >
                      Remove field
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {hiddenColumns.length > 0 && (
          <div className="p-3 border-t border-base-300">
            <label className="text-xs opacity-50 uppercase tracking-wide">
              Unused columns
            </label>
            <div className="flex flex-wrap gap-1 mt-2">
              {hiddenColumns.map((col: string) => (
                <button
                  key={col}
                  onClick={() => showColumn(col)}
                  className="badge badge-outline badge-sm gap-1 cursor-pointer hover:badge-neutral"
                >
                  + {col}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

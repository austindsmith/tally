import tallyLogo from "../../../assets/text-logo.png";
import { useSelectors } from "@/store/useSelectors";

export default function Selector() {
  // This is temporary, just testing expansion
  const [expanded, setExpanded] = useState(false);

  const selector = useSelectors((state) => state.selector);
  const setSelector = useSelectors((state) => state.setSelector);
  const startPicker = async () => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.id) return;
    const response = await browser.tabs.sendMessage(tab.id, {
      action: "startPicker",
    });
    console.log(`Selector: ${response.selector}`);
    setSelector(response.selector);
    return;
  };
  return (
    <div className="w-96 min-h-80 p-4 bg-base-200">
      <div className="flex flex-col h-full">
        <h1>Field Mappings</h1>
        <div className="flex-1 p-3 overflow-auto space-y-2">
          {/* TODO: Make this map on the column names */}
          <div
            key={14}
            className={`bg-base-100 rounded-xl border transition-all ${expanded ? "border-primary shadow-sm" : "border-base-300"}`}
          >
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full p-3 flex items-center gap-3 text-left"
            >
              <span className="font-medium">First Mapping</span>
              {selector && (
                <span className="badge badge-ghost font-mono text-xs">
                  {selector}
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 opacity-50 transition-transform ${expanded ? "rotate-180" : ""}`}
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
            {expanded && (
              <div className="px-3 pb-3 space-y-3 border-t border-base-200">
                <div className="pt-3">
                  <label className="text-xs opacity-50 uppercase tracking-wide">
                    CSS Selector
                  </label>
                  <div className="mt-1 flex gap-2">
                    <code className="flex-1 text-xs bg-base-200 p-2 rounded font-mono overflow-x-auto">
                      {selector || "None selected"}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startPicker();
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      {" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                        />
                      </svg>
                      Pick
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs opacity-50 uppercase tracking-wide">
                    Sheet Column
                  </label>
                  {/* TODO: Make this read from the sheet itself */}
                  <select className="select select-bordered select-sm w-full mt-1">
                    <option value="">Select column</option>
                    <option value="A">A - Student Name</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between"></div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button className="btn btn-success" onClick={startPicker}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 11.25 1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 1 0-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9"
              />
            </svg>
            Pick an identifier
          </button>
        </div>
      </div>
    </div>
  );
}

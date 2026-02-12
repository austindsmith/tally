import tallyLogo from "../../../assets/text-logo.png";
import { useSelectors } from "@/store/useSelectors";

export default function Selector() {
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
  //TODO: cleaner method of displaying selector than badge
  return (
    <div className="w-96 min-h-80 p-4 bg-base-200">
      <div className="flex items-center justify-center px-6 py-4">
        <img src={tallyLogo} className="h-20" />
      </div>
      <div className="badge badge-accent">{selector}</div>
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
  );
}

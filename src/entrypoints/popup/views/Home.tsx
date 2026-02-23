import { useState, useEffect } from "react";
import tallyLogo from "../../../assets/text-logo.png";
import { triggerFill } from "@/utils/fill";
import { useSelectors } from "@/store/useSelectors";
import { useGoogleSheet } from "@/store/useGoogleSheet";

async function injectContentScript() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content-scripts/content.js"],
  });
}

export default function Home() {
  const { fields } = useSelectors();
  const { data } = useGoogleSheet();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    injectContentScript();
  }, []);

  const hasMatch = Object.values(fields).some(
    (f) => f.role === "match" && f.selector,
  );
  const hasFills = Object.values(fields).some(
    (f) => f.role === "fill" && f.selector,
  );
  const ready = hasMatch && hasFills && data.length > 0;

  const handleFill = async () => {
    try {
      setStatus(null);
      setLoading(true);
      const result = await triggerFill(fields, data);

      if (result?.success) {
        setStatus(
          `Filled ${result.filled} field${result.filled === 1 ? "" : "s"} for "${result.matched}"`,
        );
      } else {
        setStatus(result?.errors?.join(", ") ?? "Fill completed");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Fill failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 min-h-80 p-4 bg-base-200">
      <div className="flex items-center justify-center px-6 py-4">
        <img src={tallyLogo} className="h-20" />
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          className={`btn btn-primary btn-wide ${loading ? "loading" : ""}`}
          onClick={handleFill}
          disabled={!ready || loading}
        >
          {loading ? "Filling..." : "Fill Grades"}
        </button>
        {!ready && (
          <p className="text-sm text-base-content/50">
            {!data.length
              ? "Connect a Google Sheet first"
              : !hasMatch
                ? "Pick a match field"
                : "Pick at least one fill field"}
          </p>
        )}
        {status && (
          <div
            className={`text-sm text-center ${status.startsWith("Filled") ? "text-success" : "text-error"}`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

import tallyLogo from "../../../assets/text-logo.png";

export default function Home() {
  return (
    <div className="w-96 min-h-80 p-4 bg-base-200">
      <div className="flex items-center justify-center px-6 py-4">
        <img src={tallyLogo} className="h-20" />
      </div>
      <div className="flex items-center justify-center gap-3"></div>
    </div>
  );
}

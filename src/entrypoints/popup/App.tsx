import { useState } from "react";
import { useGoogleSheet } from "@/store/useGoogleSheet";

function App() {
  const init = useGoogleSheet((state) => state.initFromDefault);
  const [view, setView] = useState<string>("login");
  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Content view={view} onChange={setView} />
      <Dock view={view} onChange={setView} />
    </>
  );
}
export default App;

import { useGoogleSheet } from "@/store/useGoogleSheet";
import { useSettings } from "@/store/useSettings";

function App() {
  const init = useGoogleSheet((state) => state.initFromDefault);
  const view = useSettings((state) => state.activeView);
  const setView = useSettings((state) => state.setActiveView);
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

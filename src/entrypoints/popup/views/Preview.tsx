import { useGoogleSheet } from "@/store/useGoogleSheet";

export default function Preview() {
  const data = useGoogleSheet((state) => state.data);
  const [headers, ...rows] = data;

  if (data) {
    return (
      <div className="w-200 min-h-80 p-4 card overflow x-auto">
        <table className="table table-xs">
          {/* head */}
          <thead>
            <tr>
              {headers.map((col: string) => (
                <td key={col}>{col}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {rows.map((row: string[]) => (
              <tr>
                {row.map((col: string) => (
                  <td key={col}>{col}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else {
    return <h1>NO DATA</h1>;
  }
}

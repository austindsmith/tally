import { useGoogleSheet } from "@/store/useGoogleSheet";
import _ from "lodash";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

// TODO: Make a conversion temporarily to map like the below:
// const data = [{ id: 1, name: "Ada" }];
// const columns = [{ accessorKey: "name", header: "Name" }];
type ColumnSort = {
  id: string;
  desc: boolean;
};
type SortingState = ColumnSort[];
export default function MasterTable() {
  const data = useGoogleSheet((state) => state.data);
  const [headers, ...rows] = data;

  const tableData = rows.map((row) => _.zipObject(headers, row));
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = headers.map((header: string) => ({
    id: header,
    accessorKey: header,
    header: header,
    enableResizing: true,
  }));
  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    manualFiltering: true,
  });

  if (data) {
    return (
      <div className="w-200 min-h-80 p-4 card overflow x-auto">
        <table className="table table-xs">
          {/* head */}
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={() => header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
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

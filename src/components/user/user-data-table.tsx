type UserDataTableProps = {
    headers: string[];
    rows: (string | React.ReactNode)[][];
    emptyMessage?: string;
};

export function UserDataTable({ headers, rows, emptyMessage = "No records found." }: UserDataTableProps) {
    if (rows.length === 0) {
        return <p className="text-sm text-slate-500">{emptyMessage}</p>;
    }

    // console.log("Row", rows);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-slate-200 hover:bg-slate-50">
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className={`px-4 py-4 text-slate-700 ${cellIndex === 0 ? "font-medium text-slate-900" : ""}`}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

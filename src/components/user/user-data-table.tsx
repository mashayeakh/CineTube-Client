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
                <thead>
                    <tr className="border-b border-slate-200">
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-slate-100 hover:bg-slate-50">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-2.5 pr-4 text-slate-700">
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

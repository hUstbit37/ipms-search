"use client"

interface WipoProcessProps {
  wipo_process?: Array<{
    "Tiến trình"?: string;
    "Ngày"?: string;
    "Trạng thái"?: string;
  }> | null;
}

export default function WipoProcess({ wipo_process }: WipoProcessProps) {
  if (!wipo_process || !Array.isArray(wipo_process) || wipo_process.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center">Không có dữ liệu tiến trình</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Tiến trình</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Ngày</th>
              {/* <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Trạng thái</th> */}
            </tr>
          </thead>
          <tbody>
            {wipo_process.map((process, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="px-4 py-2 text-sm text-gray-700">{process["Tiến trình"] || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{process["Ngày"] || ""}</td>
                {/* <td className="px-4 py-2 text-sm text-gray-700">{process["Trạng thái"] || ""}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


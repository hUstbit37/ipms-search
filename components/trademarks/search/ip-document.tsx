"use client"

interface Document {
  document_type?: string | null;
  display_name?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
}

interface IpDocumentProps {
  documents?: Document[] | null;
}

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export default function IpDocument({ documents }: IpDocumentProps) {
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center">Không có tài liệu đính kèm</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm text-gray-900 mb-4">Tài liệu đính kèm</div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 border-b w-16">STT</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Loại tài liệu</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Tên tài liệu</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Loại file</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Kích thước</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700 text-center">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.document_type || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.display_name || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.file_type || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{formatFileSize(doc.file_size)}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {doc.file_path ? (
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Xem tài liệu
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


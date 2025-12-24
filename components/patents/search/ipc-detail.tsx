"use client"

interface IpcDetailProps {
  ipc_list_raw?: string[] | string | null;
  ipc_list?: string[] | string | null;
}

export default function IpcDetail({ ipc_list_raw, ipc_list }: IpcDetailProps) {
  const ipcLines: string[] = (() => {
    // Ưu tiên ipc_list_raw
    if (Array.isArray(ipc_list_raw) && ipc_list_raw.length > 0) {
      return ipc_list_raw
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof ipc_list_raw === "string" && ipc_list_raw.trim().length > 0) {
      return [ipc_list_raw.trim()];
    }
    // Fallback về ipc_list
    if (Array.isArray(ipc_list) && ipc_list.length > 0) {
      return ipc_list
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof ipc_list === "string" && ipc_list.trim().length > 0) {
      // ipc_list có thể là chuỗi phân cách bằng dấu phẩy hoặc khoảng trắng
      return ipc_list
        .split(/[,;\s]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  })();

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Phân loại IPC</div>
      <div className="text-sm text-gray-700 flex-1">
        {ipcLines.length > 0 ? (
          ipcLines.map((ipc, idx) => (
            <div key={`${ipc}-${idx}`} className="mb-1">{ipc}</div>
          ))
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


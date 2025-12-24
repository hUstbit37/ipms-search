"use client"

interface LocarnoDetailProps {
  locarno_list?: Array<{ subclass?: string | null; class_number?: string | null }> | string[] | string | null;
  locarno_list_raw?: string[] | string | null;
}

export default function LocarnoDetail({ locarno_list, locarno_list_raw }: LocarnoDetailProps) {
  const locarnoLines: string[] = (() => {
    // Ưu tiên locarno_list_raw
    if (Array.isArray(locarno_list_raw) && locarno_list_raw.length > 0) {
      return locarno_list_raw
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof locarno_list_raw === "string" && locarno_list_raw.trim().length > 0) {
      return [locarno_list_raw.trim()];
    }
    // Xử lý locarno_list
    if (Array.isArray(locarno_list) && locarno_list.length > 0) {
      // Kiểm tra xem có phải là mảng object không
      const firstItem = locarno_list[0];
      if (typeof firstItem === "object" && firstItem !== null && !Array.isArray(firstItem)) {
        // Nếu là object có subclass và class_number
        return (locarno_list as Array<{ subclass?: string | null; class_number?: string | null }>)
          .map((item) => {
            const classNum = item.class_number || "";
            const subclass = item.subclass || "";
            if (classNum && subclass) {
              return `${classNum}-${subclass}`;
            }
            return classNum || subclass || "";
          })
          .filter((item: string) => item.trim().length > 0);
      }
      // Nếu là mảng string
      if (typeof firstItem === "string") {
        return (locarno_list as string[])
          .filter((entry) => typeof entry === "string" && entry.trim().length > 0)
          .map((entry) => entry.trim());
      }
    }
    // Nếu locarno_list là string
    if (typeof locarno_list === "string" && locarno_list.trim().length > 0) {
      return [locarno_list.trim()];
    }
    return [];
  })();

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Phân loại Locarno</div>
      <div className="text-sm text-gray-700 flex-1">
        {locarnoLines.length > 0 ? (
          locarnoLines.map((locarno, idx) => (
            <div key={`${locarno}-${idx}`} className="mb-1">{locarno}</div>
          ))
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


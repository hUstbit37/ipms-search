"use client"

interface NiceDetailProps {
  nice_class_list_raw?: string[] | string | null;
  nice_class_list?: string[] | null;
  nice_class_text?: string | null;
}

export default function NiceDetail({ nice_class_list_raw, nice_class_list, nice_class_text }: NiceDetailProps) {
  const { niceLines, isCommaSeparated } = (() => {
    // Ưu tiên nice_class_list_raw
    if (Array.isArray(nice_class_list_raw) && nice_class_list_raw.length > 0) {
      return {
        niceLines: nice_class_list_raw
          .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
          .map((entry: string) => entry.trim()),
        isCommaSeparated: false
      };
    }
    if (typeof nice_class_list_raw === "string" && nice_class_list_raw.trim().length > 0) {
      return {
        niceLines: [nice_class_list_raw.trim()],
        isCommaSeparated: false
      };
    }
    // Fallback về nice_class_list - hiển thị cách nhau dấu phẩy
    if (Array.isArray(nice_class_list) && nice_class_list.length > 0) {
      return {
        niceLines: nice_class_list
          .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
          .map((entry: string) => entry.trim()),
        isCommaSeparated: true
      };
    }
    // Fallback về nice_class_text
    if (nice_class_text) {
      // nice_class_text có thể là chuỗi phân cách bằng dấu phẩy hoặc khoảng trắng
      return {
        niceLines: nice_class_text
          .split(/[,;\s]+/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
        isCommaSeparated: false
      };
    }
    return { niceLines: [], isCommaSeparated: false };
  })();

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Lớp Nice</div>
      <div className="text-sm text-gray-700 flex-1">
        {niceLines.length > 0 ? (
          isCommaSeparated ? (
            <div>{niceLines.join(", ")}</div>
          ) : (
            niceLines.map((nice, idx) => (
              <div key={`${nice}-${idx}`} className="mb-1">{nice}</div>
            ))
          )
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


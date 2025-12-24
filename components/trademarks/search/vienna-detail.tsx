"use client"

interface ViennaDetailProps {
  vienna_class_list_raw?: string[] | string | null;
  vienna_class?: string | null;
}

export default function ViennaDetail({ vienna_class_list_raw, vienna_class }: ViennaDetailProps) {
  const viennaLines: string[] = (() => {
    // Ưu tiên vienna_class_list_raw
    if (Array.isArray(vienna_class_list_raw) && vienna_class_list_raw.length > 0) {
      return vienna_class_list_raw
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof vienna_class_list_raw === "string" && vienna_class_list_raw.trim().length > 0) {
      return [vienna_class_list_raw.trim()];
    }
    // Fallback về vienna_class
    if (vienna_class) {
      // vienna_class có thể là chuỗi phân cách bằng dấu phẩy hoặc khoảng trắng
      return vienna_class
        .split(/[,;\s]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  })();

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Vienna Classes</div>
      <div className="text-sm text-gray-700 flex-1">
        {viennaLines.length > 0 ? (
          viennaLines.map((vienna, idx) => (
            <div key={`${vienna}-${idx}`} className="mb-1">{vienna}</div>
          ))
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


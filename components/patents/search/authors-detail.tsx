"use client"

interface AuthorsDetailProps {
  authors_raw?: string[] | string | null;
  authors?: Array<{ name?: string | null }> | string[] | string | null;
}

export default function AuthorsDetail({ authors_raw, authors }: AuthorsDetailProps) {
  const authorLines: string[] = (() => {
    // Ưu tiên authors_raw
    if (Array.isArray(authors_raw) && authors_raw.length > 0) {
      return authors_raw
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof authors_raw === "string" && authors_raw.trim().length > 0) {
      return [authors_raw.trim()];
    }
    // Fallback về authors
    if (Array.isArray(authors) && authors.length > 0) {
      // Nếu là mảng object có name
      if (typeof authors[0] === "object" && authors[0] !== null && "name" in authors[0]) {
        return authors
          .map((author: { name?: string | null }) => author?.name)
          .filter((name: string | null | undefined): name is string => Boolean(name && name.trim()))
          .map((name: string) => name.trim());
      }
      // Nếu là mảng string
      if (typeof authors[0] === "string") {
        return authors
          .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
          .map((entry: string) => entry.trim());
      }
    }
    // Nếu authors là string
    if (typeof authors === "string" && authors.trim().length > 0) {
      return [authors.trim()];
    }
    return [];
  })();

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Tác giả</div>
      <div className="text-sm text-gray-700 flex-1">
        {authorLines.length > 0 ? (
          authorLines.map((author, idx) => (
            <div key={`${author}-${idx}`} className="mb-1">{author}</div>
          ))
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


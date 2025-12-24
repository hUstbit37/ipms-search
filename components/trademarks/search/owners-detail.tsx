"use client"

interface OwnersDetailProps {
  owners_raw?: string[] | string | null;
  owners?: Array<{ name?: string | null }> | null;
  owner_name?: string | null;
}

export default function OwnersDetail({ owners_raw, owners, owner_name }: OwnersDetailProps) {
  const ownerLines: string[] = (() => {
    // Ưu tiên owners_raw
    if (Array.isArray(owners_raw) && owners_raw.length > 0) {
      return owners_raw
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof owners_raw === "string" && owners_raw.trim().length > 0) {
      return [owners_raw.trim()];
    }
    // Fallback về owners
    if (Array.isArray(owners) && owners.length > 0) {
      return owners
        .map((owner: { name?: string | null }) => owner?.name)
        .filter((name: string | null | undefined): name is string => Boolean(name && name.trim()))
        .map((name: string) => name.trim());
    }
    // Fallback về owner_name
    if (owner_name) return [owner_name];
    return [];
  })();

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Chủ đơn</div>
      <div className="text-sm text-gray-700 flex-1">
        {ownerLines.length > 0 ? (
          ownerLines.map((owner, idx) => (
            <div key={`${owner}-${idx}`} className="mb-1">{owner}</div>
          ))
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


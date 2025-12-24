"use client"

interface AgenciesDetailProps {
  agencies_raw?: string[] | string | null;
  agencies?: Array<{ name?: string | null }> | null;
  agency_name?: string | null;
}

export default function AgenciesDetail({ agencies_raw, agencies, agency_name }: AgenciesDetailProps) {
  const agencyLines: string[] = (() => {
    // Ưu tiên agencies_raw
    if (Array.isArray(agencies_raw) && agencies_raw.length > 0) {
      return agencies_raw
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof agencies_raw === "string" && agencies_raw.trim().length > 0) {
      return [agencies_raw.trim()];
    }
    // Fallback về agencies
    if (Array.isArray(agencies) && agencies.length > 0) {
      return agencies
        .map((agency: { name?: string | null }) => agency?.name)
        .filter((name: string | null | undefined): name is string => Boolean(name && name.trim()))
        .map((name: string) => name.trim());
    }
    // Fallback về agency_name
    if (agency_name) return [agency_name];
    return [];
  })();

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Đại diện</div>
      <div className="text-sm text-gray-700 flex-1">
        {agencyLines.length > 0 ? (
          agencyLines.map((agency, idx) => (
            <div key={`${agency}-${idx}`} className="mb-1">{agency}</div>
          ))
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


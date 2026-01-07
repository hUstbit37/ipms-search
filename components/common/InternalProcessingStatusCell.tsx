"use client";

import { InternalProcessingStatusCompact } from "./InternalProcessingStatusCompact";
import type { IpType } from "@/services/internal-processing-status.service";

interface InternalProcessingStatusCellProps {
  ipType: IpType;
  applicationNumber: string;
}

export function InternalProcessingStatusCell({
  ipType,
  applicationNumber,
}: InternalProcessingStatusCellProps) {
  return (
    <InternalProcessingStatusCompact
      ipType={ipType}
      applicationNumber={applicationNumber}
    />
  );
}


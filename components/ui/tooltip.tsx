import { PlacesType, Tooltip as ReactTooltip } from "react-tooltip";
import { v4 } from "uuid";
import { ReactNode } from "react";

interface Props {
  id?: string;
  children?: ReactNode;
  content?: string;
  place?: PlacesType;
}

export function Tooltip({ id, children, content, place = "top" }: Props) {
  const tooltipId = id ? id : `tooltip_${v4()}`;

  return (
    <>
      <a data-tooltip-id={tooltipId} data-tooltip-content={content}>
        {children}
      </a>
      <ReactTooltip id={tooltipId} place={place} />
    </>
  );
}

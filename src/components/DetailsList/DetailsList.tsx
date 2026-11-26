import type { ReactNode } from "react";
import s from "./DetailsList.module.css";

export interface DetailsListProps {
  /** LabelValueRow children, size xs. Leave out the rows a state does not need. */
  children: ReactNode;
  "aria-label"?: string;
  className?: string;
}

/** The order details under the form: one <dl> of Label-value rows. */
export function DetailsList({ children, className, ...aria }: DetailsListProps) {
  return (
    <dl {...aria} className={className ? `${s.list} ${className}` : s.list}>
      {children}
    </dl>
  );
}

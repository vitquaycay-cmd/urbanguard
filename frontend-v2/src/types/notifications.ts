export type NotifType =
  | "ALL"
  | "UNREAD"
  | "REPORT_UPDATE"
  | "SYSTEM"
  | "AREA_ALERT";

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  readAt: string | null;
  createdAt: string;
  reportId?: number;
}

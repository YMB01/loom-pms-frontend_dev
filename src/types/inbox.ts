export type BroadcastMessageType =
  | "announcement"
  | "warning"
  | "maintenance"
  | "urgent";

export type InboxMessage = {
  id: number;
  title: string;
  body: string;
  type: BroadcastMessageType;
  sent_at: string | null;
  is_read: boolean;
};

export type InboxMessagesApiResponse = {
  success: boolean;
  data?: {
    messages: InboxMessage[];
  };
  message: string;
};

export type InboxUnreadCountApiResponse = {
  success: boolean;
  data?: {
    unread_count: number;
  };
  message: string;
};

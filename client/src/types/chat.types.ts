export interface ChatMessage {
  message_id: number;
  user_id: number;
  sender_id: number;
  body: string;
  sent_at: string;
  is_read: boolean;
}

export interface ConversationSummary {
  user_id: number;
  full_name: string;
  email: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

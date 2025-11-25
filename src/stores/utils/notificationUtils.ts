import type { Notification } from "@/types";
import { generateId } from "./gameUtils";

// Generate a notification with consistent structure
export const generateNotification = (
  type: Notification["type"],
  title: string,
  message: string
): Notification => ({
  id: generateId(),
  type,
  title,
  message,
  timestamp: Date.now(),
  read: false,
});

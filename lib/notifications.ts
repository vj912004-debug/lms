
import prisma from "./prisma"; // Prisma client with latest types

export type NotificationType = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "INFO",
  link?: string
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function markAsRead(notificationId: string) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

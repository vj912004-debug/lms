
import prisma from "./prisma";

export async function logActivity(
  userId: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: any,
  ipAddress?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

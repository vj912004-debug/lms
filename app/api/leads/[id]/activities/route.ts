
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Updated types
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(req);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const activities = await prisma.activityLog.findMany({
      where: {
        targetType: "LEAD",
        targetId: id
      },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[LEAD_ACTIVITIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

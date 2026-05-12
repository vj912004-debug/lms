
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(req);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { type } = await req.json();

    await logActivity(
      session.userId,
      `COMM_${type}`,
      "LEAD",
      id,
      `Triggered ${type.toLowerCase()} communication`
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LEAD_LOG_COMM_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

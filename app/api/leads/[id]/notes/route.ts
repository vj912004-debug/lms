
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

    const { note } = await req.json();

    if (!note) return new NextResponse("Note content is required", { status: 400 });

    await logActivity(
      session.userId,
      "NOTE_ADDED",
      "LEAD",
      id,
      note
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LEAD_NOTES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

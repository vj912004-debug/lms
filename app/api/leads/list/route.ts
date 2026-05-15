import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin, isManager } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = getSession(req);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assignedTo");
    const statusId = searchParams.get("statusId");
    const source = searchParams.get("source");
    const query = searchParams.get("query");

    const where: any = {};

    // Role-based filtering
    if (!isAdmin(session.role) && !isManager(session.role)) {
      // Sales agents can only see their own leads
      where.assignedTo = session.userId;
    } else {
      // Admins and Managers can filter by assignedTo
      if (assignedTo) where.assignedTo = assignedTo;
    }

    if (statusId) where.statusId = statusId;
    if (source) where.source = source;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: { 
        status: true, 
        agent: true, 
        tags: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("[LEADS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

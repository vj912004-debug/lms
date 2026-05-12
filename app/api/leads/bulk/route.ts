
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = getSession(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { leads } = await req.json();

    if (!Array.isArray(leads)) {
      return new NextResponse("Invalid data format", { status: 400 });
    }

    // Get default stage
    let defaultStage = await prisma.pipelineStage.findFirst({
      where: { name: "New Lead" }
    });

    if (!defaultStage) {
      defaultStage = await prisma.pipelineStage.create({
        data: { name: "New Lead", order: 1, color: "#6366f1" }
      });
    }

    const createdLeads = await prisma.lead.createMany({
      data: leads.map((lead: any) => ({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source || "Bulk Import",
        score: lead.score || 0,
        statusId: defaultStage.id,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      message: `Successfully imported ${createdLeads.count} leads`,
      count: createdLeads.count 
    });
  } catch (error) {
    console.error("[LEADS_BULK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = getSession(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      include: {
        status: { select: { name: true } },
        agent: { select: { name: true } }
      }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("[LEADS_BULK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

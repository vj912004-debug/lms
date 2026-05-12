import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, phone, company, source, notes } = data;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Duplicate detection (by email or phone)
    if (email || phone) {
      const existingLead = await prisma.lead.findFirst({
        where: {
          OR: [
            email ? { email } : {},
            phone ? { phone } : {}
          ].filter(q => Object.keys(q).length > 0)
        }
      });
      if (existingLead) {
        return NextResponse.json({ 
          message: "Duplicate lead detected", 
          lead: existingLead,
          conflict: existingLead.email === email ? "email" : "phone"
        }, { status: 409 }); // Use 409 Conflict
      }
    }


    // Get the "New Lead" stage
    let newLeadStage = await prisma.pipelineStage.findFirst({
      where: { name: "New Lead" }
    });

    if (!newLeadStage) {
      newLeadStage = await prisma.pipelineStage.create({
        data: { name: "New Lead", order: 1, color: "#6366f1" }
      });
    }

    // Automated Assignment (Module 3 - Round Robin / Fewest Leads)
    let assignedTo = null;
    const salesAgents = await prisma.user.findMany({
      where: { role: "SALES" },
      include: { _count: { select: { leads: true } } },
      orderBy: { leads: { _count: 'asc' } },
      take: 1
    });

    if (salesAgents.length > 0) {
      assignedTo = salesAgents[0].id;
    }

    // Automated Scoring logic (Module 7)
    let score = 50; // Base score
    if (email && email.includes(".edu")) score += 10;
    if (company) score += 15;
    if (phone) score += 5;

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        source: source || "API",
        notes,
        score,
        statusId: newLeadStage.id,
        assignedTo,
      }
    });

    // Log the assignment
    if (assignedTo) {
      await prisma.assignmentHistory.create({
        data: {
          leadId: lead.id,
          assignedTo,
          assignedBy: "SYSTEM"
        }
      });
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[LEADS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
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

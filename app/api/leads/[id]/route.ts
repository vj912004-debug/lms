import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        status: true,
        agent: true,
        tasks: true,
        tags: true,
      },
    });

    if (!lead) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("[LEAD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSession(req);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const { 
      name, email, phone, company, source, notes, statusId, assignedTo, followUpDate 
    } = await req.json();

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        source,
        notes,
        statusId,
        assignedTo,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      } as any,
      include: {
        status: true,
        agent: true,
        tags: true,
        tasks: true,
      }
    });

    // If follow-up date is set, create a notification
    if (followUpDate) {
      await prisma.notification.create({
        data: {
          userId: lead.assignedTo || session.userId,
          title: "Follow-up Scheduled",
          message: `Follow-up scheduled for ${lead.name} on ${new Date(followUpDate).toLocaleString()}`,
          type: "INFO",
        }
      });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("[LEAD_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lead.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LEAD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

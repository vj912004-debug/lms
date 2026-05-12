
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = getSession(req);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const tasks = await prisma.task.findMany({
      where: session.role === "SALES" ? { assignedTo: session.userId } : {},
      include: {
        lead: {
          select: { name: true, company: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession(req);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { title, description, dueDate, priority, type, leadId, assignedTo } = await req.json();

    if (!title) return new NextResponse("Title is required", { status: 400 });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        type: type || "FOLLOW_UP",
        leadId,
        assignedTo: assignedTo || session.userId,
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[TASKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

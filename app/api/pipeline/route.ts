import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = getSession(req);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const where: any = {};
    if (session.role === "SALES") {
      where.assignedTo = session.userId;
    }

    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' },
      include: {
        leads: {
          where,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { leads: { where } }
        }
      }
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error("[PIPELINE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, color, order } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const stage = await prisma.pipelineStage.create({
      data: {
        name,
        color,
        order: order || 0,
      }
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error("[PIPELINE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

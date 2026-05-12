
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = getSession(req);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(stages);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession(req);
    if (!session || session.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, color, order } = await req.json();

    const stage = await prisma.pipelineStage.create({
      data: { name, color, order: parseInt(order) }
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("[PIPELINE_STAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = getSession(req);
    if (!session || session.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, name, color, order } = await req.json();

    const stage = await prisma.pipelineStage.update({
      where: { id },
      data: { name, color, order: parseInt(order) }
    });

    return NextResponse.json(stage);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = getSession(req);
    if (!session || session.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("ID required", { status: 400 });

    await prisma.pipelineStage.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

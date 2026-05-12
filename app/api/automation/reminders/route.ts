import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Find leads with NO tasks and that were created more than 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const staleLeads = await prisma.lead.findMany({
      where: {
        createdAt: { lt: oneDayAgo },
        tasks: { none: {} },
        status: { name: { notIn: ["Converted", "Lost", "Won", "Rejected"] } }
      }
    });

    let createdCount = 0;

    // 2. Create an automated follow-up task and notification for each stale lead
    for (const lead of staleLeads) {
      const task = await prisma.task.create({
        data: {
          title: "Automated Follow-up: Contact this lead",
          leadId: lead.id,
          dueDate: new Date(Date.now() + 86400000), // Due tomorrow
          assignedTo: lead.assignedTo,
          priority: "HIGH",
          type: "FOLLOW_UP"
        }
      });

      if (lead.assignedTo) {
        await prisma.notification.create({
          data: {
            userId: lead.assignedTo,
            title: "Action Required: Stale Lead",
            message: `Lead ${lead.name} has no follow-up tasks. An automated task has been created.`,
            type: "WARNING",
            link: `/leads`
          }
        });
      }
      createdCount++;
    }


    return NextResponse.json({ 
      message: "Automation check complete", 
      leadsProcessed: staleLeads.length,
      tasksCreated: createdCount 
    });
  } catch (error) {
    console.error("[AUTOMATION_REMINDERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

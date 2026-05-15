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
    const userId = session.userId;
    const role = session.role;

    const whereClause: any = {};
    if (!isAdmin(role) && !isManager(role)) {
      whereClause.assignedTo = userId;
    }

    // 1. Core Summary Stats
    const totalLeads = await prisma.lead.count({ where: whereClause });

    
    // Converted leads (assuming "Converted" or "Won" in name)
    const convertedLeads = await prisma.lead.count({
      where: {
        ...whereClause,
        status: {
          name: { in: ["Converted", "Won"] }
        }
      }
    });

    const lostLeads = await prisma.lead.count({
      where: {
        ...whereClause,
        status: {
          name: { in: ["Lost", "Rejected"] }
        }
      }
    });

    const myTasksCount = userId ? await prisma.task.count({
      where: { assignedTo: userId, completed: false }
    }) : 0;


    // 2. Lead Acquisition (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLeads = await prisma.lead.groupBy({
      by: ['createdAt'],
      where: {
        ...whereClause,
        createdAt: { gte: sevenDaysAgo }
      },
      _count: true
    });

    // Group by day for the chart
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const acquisitionData = days.map((day, index) => {
      // Find leads for this specific day of the week
      const count = recentLeads
        .filter(l => new Date(l.createdAt).getDay() === index)
        .reduce((sum, item) => sum + item._count, 0);
      
      return { name: day, leads: count };
    });

    // 3. Source Distribution
    const sourceStats = await prisma.lead.groupBy({
      by: ['source'],
      where: whereClause,
      _count: true
    });

    // 4. Status Distribution
    const statusStats = await prisma.lead.groupBy({
      by: ['statusId'],
      where: whereClause,
      _count: true
    });

    // 5. Revenue tracking (Potential)
    const revenueStats = await prisma.lead.aggregate({
      where: {
        ...whereClause,
        status: {
          name: { in: ["Converted", "Won"] }
        }
      },
      _sum: {
        potential: true
      }
    });


    const totalPotential = await prisma.lead.aggregate({
      _sum: {
        potential: true
      }
    });

    // 6. Sales Team Performance
    const staffPerformance = await prisma.user.findMany({
      where: { role: "SALES" },
      select: {
        name: true,
        _count: {
          select: {
            leads: true,
            tasks: { where: { completed: true } }
          }
        },
        leads: {
          where: {
            status: { name: { in: ["Converted", "Won"] } }
          },
          select: { potential: true }
        }
      }
    });

    const staffData = staffPerformance.map(staff => ({
      name: staff.name,
      leads: staff._count.leads,
      completedTasks: staff._count.tasks,
      revenue: staff.leads.reduce((sum, lead) => sum + lead.potential, 0)
    }));

    return NextResponse.json({
      summary: {
        totalLeads,
        convertedLeads,
        lostLeads,
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
        currentRevenue: revenueStats._sum.potential || 0,
        totalPotential: totalPotential._sum.potential || 0
      },
      acquisitionData,
      sourceStats,
      statusStats,
      staffData,
      myTasksCount
    });


  } catch (error) {
    console.error("[STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

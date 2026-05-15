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

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Core Summary Stats (All time)
    const totalLeads = await prisma.lead.count({ where: whereClause });

    const convertedLeads = await prisma.lead.count({
      where: {
        ...whereClause,
        status: { name: { in: ["Converted", "Won"] } }
      }
    });

    const activePotential = await prisma.lead.aggregate({
      where: {
        ...whereClause,
        status: { name: { notIn: ["Converted", "Won", "Lost", "Rejected"] } }
      },
      _sum: { potential: true }
    });

    const wonRevenue = await prisma.lead.aggregate({
      where: {
        ...whereClause,
        status: { name: { in: ["Converted", "Won"] } }
      },
      _sum: { potential: true }
    });

    const myTasksCount = userId ? await prisma.task.count({
      where: { assignedTo: userId, completed: false }
    }) : 0;

    // 2. Trend Calculations (Last 7 days vs Previous 7 days)
    const currentLeads = await prisma.lead.count({
      where: { ...whereClause, createdAt: { gte: sevenDaysAgo } }
    });
    const previousLeads = await prisma.lead.count({
      where: { ...whereClause, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
    });

    const currentConverted = await prisma.lead.count({
      where: { 
        ...whereClause, 
        updatedAt: { gte: sevenDaysAgo },
        status: { name: { in: ["Converted", "Won"] } }
      }
    });
    const previousConverted = await prisma.lead.count({
      where: { 
        ...whereClause, 
        updatedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        status: { name: { in: ["Converted", "Won"] } }
      }
    });

    const currentRevenue = await prisma.lead.aggregate({
      where: { 
        ...whereClause, 
        createdAt: { gte: sevenDaysAgo },
        status: { name: { notIn: ["Lost", "Rejected"] } }
      },
      _sum: { potential: true }
    });
    const previousRevenue = await prisma.lead.aggregate({
      where: { 
        ...whereClause, 
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        status: { name: { notIn: ["Lost", "Rejected"] } }
      },
      _sum: { potential: true }
    });

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const diff = ((current - previous) / previous) * 100;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`;
    };

    const trends = {
      leadsTrend: calculateTrend(currentLeads, previousLeads),
      conversionTrend: calculateTrend(currentConverted, previousConverted),
      revenueTrend: calculateTrend(currentRevenue._sum.potential || 0, previousRevenue._sum.potential || 0),
      tasksTrend: "Stable" // Simplified for now
    };

    // 3. Lead Acquisition (Chronological 7 days)
    const recentLeads = await prisma.lead.groupBy({
      by: ['createdAt'],
      where: {
        ...whereClause,
        createdAt: { gte: sevenDaysAgo }
      },
      _count: true
    });

    const acquisitionData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = recentLeads
        .filter(l => new Date(l.createdAt).toDateString() === date.toDateString())
        .reduce((sum, item) => sum + item._count, 0);
      
      return { name: dayName, leads: count, date: date.toISOString().split('T')[0] };
    });

    // 4. Staff Performance & Distributions (for future use)
    const sourceStats = await prisma.lead.groupBy({
      by: ['source'],
      where: whereClause,
      _count: true
    });

    const statusStats = await prisma.lead.groupBy({
      by: ['statusId'],
      where: whereClause,
      _count: true
    });

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
          where: { status: { name: { in: ["Converted", "Won"] } } },
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
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
        activePotential: activePotential._sum.potential || 0,
        wonRevenue: wonRevenue._sum.potential || 0,
        currentRevenue: activePotential._sum.potential || 0 // For backward compatibility with frontend
      },
      trends,
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

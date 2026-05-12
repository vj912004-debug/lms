import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@lms.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@lms.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  // Create default agent user
  const agentPassword = await bcrypt.hash("agent123", 10);
  await prisma.user.upsert({
    where: { email: "agent@lms.com" },
    update: {},
    create: {
      name: "Sales Agent",
      email: "agent@lms.com",
      password: agentPassword,
      role: "SALES",
    },
  });
  console.log("Agent user seeded.");

  const stages = [
    { name: "New Lead", order: 1, color: "#6366f1" },
    { name: "Contacted", order: 2, color: "#8b5cf6" },
    { name: "Interested", order: 3, color: "#ec4899" },
    { name: "Follow-up", order: 4, color: "#f59e0b" },
    { name: "Converted", order: 5, color: "#10b981" },
    { name: "Lost", order: 6, color: "#ef4444" },
  ];

  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { name: stage.name },
      update: {},
      create: stage,
    });
  }

  console.log("Seeding stages finished.");

  const newLeadStage = await prisma.pipelineStage.findFirst({ where: { name: "New Lead" } });
  
  if (newLeadStage) {
    const sampleLeads = [
      { name: "John Smith", email: "john@techcorp.com", phone: "+123456789", company: "TechCorp", source: "Facebook Ads", score: 85, statusId: newLeadStage.id },
      { name: "Emily Blunt", email: "emily@designstudio.io", phone: "+987654321", company: "DesignStudio", source: "Website Form", score: 92, statusId: newLeadStage.id },
      { name: "David Miller", email: "david@logistics.net", phone: "+1122334455", company: "GlobalLogistics", source: "Referral", score: 64, statusId: newLeadStage.id },
    ];

    for (const lead of sampleLeads) {
      await prisma.lead.create({ data: lead });
    }
    console.log("Seeding leads finished.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing prisma.notification...");
    // Just try to access the property, don't necessarily call anything if we don't have data
    const keys = Object.keys(prisma);
    console.log("Prisma keys:", keys.filter(k => !k.startsWith('_')));
    
    if (prisma.notification) {
      console.log("✅ prisma.notification exists!");
    } else {
      console.log("❌ prisma.notification does NOT exist!");
    }
  } catch (e) {
    console.error("Error during test:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();

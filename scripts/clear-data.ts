import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAllData() {
  try {
    console.log('Clearing all data...')
    
    // Delete in order to respect foreign key constraints
    await prisma.focusBlock.deleteMany()
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.weeklyFocus.deleteMany()
    await prisma.routine.deleteMany()
    
    console.log('✅ All data cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllData()


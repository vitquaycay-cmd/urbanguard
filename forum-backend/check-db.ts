import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.forumUser.count();
    const postCount = await prisma.forumPost.count();
    console.log(`ForumUsers: ${userCount}`);
    console.log(`ForumPosts: ${postCount}`);
  } catch (e) {
    console.error('Error checking counts:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

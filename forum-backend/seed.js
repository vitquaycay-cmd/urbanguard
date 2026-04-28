require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 5000,
});



const prisma = new PrismaClient({ adapter });

async function main() {
  const cat = await prisma.forumCategory.create({
    data: {
      name: "Chung",
      slug: "chung",
    },
  });

  console.log("Category created:", cat);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
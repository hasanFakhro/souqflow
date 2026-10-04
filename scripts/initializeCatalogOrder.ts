import prisma from "../lib/prisma";

async function main() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  for (let i = 0; i < products.length; i++) {
    await prisma.product.update({
      where: {
        id: products[i].id,
      },
      data: {
        catalogOrder: i + 1,
      },
    });

    console.log(`${i + 1}. ${products[i].name}`);
  }

  console.log("Catalog order initialized successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
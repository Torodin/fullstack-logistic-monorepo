import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../generated/prisma/client";
import * as bcrypt from 'bcrypt';

// Initialize Prisma Client
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding...');

    const supervisorPassword = process.env.SUPERVISOR_PASSWORD;
    if (!supervisorPassword) throw new Error('SUPERVISOR_PASSWORD environment variable is not set');
    const hashedPassword = await bcrypt.hash(supervisorPassword, 10)

    // Create a user
    const supervisor = await prisma.user.upsert({
        where: { email: 'supervisor@supervisor.com' },
        update: {},
        create: {
            email: 'supervisor@supervisor.com',
            name: 'Supervisor',
            password: hashedPassword,
            role: Role.SUPERVISOR
        },
    });
    console.log(`Created user with id: ${supervisor.id}`);

    console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

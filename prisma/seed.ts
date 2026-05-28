import {
  AuditAction,
  AuditEntityType,
  InvoiceStatus,
  PrismaClient,
  TransactionType,
  VATRate,
} from "@prisma/client";
import Decimal from "decimal.js";
import { subDays, subMonths } from "date-fns";
import { PrismaPg as PostgresAdapter } from "@prisma/adapter-pg";

const seedConnectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!seedConnectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set for seeding.");
}

const seedConnectionUrl = new URL(seedConnectionString);
seedConnectionUrl.searchParams.delete("sslmode");
seedConnectionUrl.searchParams.delete("sslcert");
seedConnectionUrl.searchParams.delete("sslkey");
seedConnectionUrl.searchParams.delete("sslrootcert");
const adapterSeedConnectionString = seedConnectionUrl.toString();

const prisma = new PrismaClient({
  adapter: new PostgresAdapter(
    {
      connectionString: adapterSeedConnectionString,
      ssl: { rejectUnauthorized: false },
    },
  ),
});

const VENDORS = [
  "REWE Markt GmbH",
  "Deutsche Telekom AG",
  "Siemens AG",
  "Amazon Web Services EMEA SARL",
  "Deutsche Bahn AG",
  "Lufthansa Group",
  "Salesforce.com Germany GmbH",
  "Adobe Systems GmbH",
  "E.ON SE",
  "SAP SE",
  "Allianz SE",
  "Vodafone GmbH",
] as const;

const CATEGORIES = [
  "Office Supplies",
  "Telecommunication",
  "Hardware",
  "Cloud Infrastructure",
  "Travel",
  "Software Licenses",
  "Utilities",
  "Insurance",
] as const;

const DEMO_EMAIL = process.env.SEED_USER_EMAIL ?? "demo@finflow-app.de";
const DEMO_COMPANY_NAME =
  process.env.SEED_COMPANY_NAME ?? "Musterfirma GmbH";
const DEMO_PLAN = process.env.SEED_PLAN ?? "PRO";
const DEMO_CLERK_ID =
  process.env.SEED_CLERK_ID ?? process.env.DEMO_CLERK_ID ?? "seed_demo_clerk_id";

const centsToAmount = (cents: number): string => {
  return new Decimal(cents).div(100).toFixed(2);
};

const buildExpenseAmount = (index: number): string => {
  const cents = 5000 + ((index * 17391) % 245001);
  return centsToAmount(cents);
};

const buildIncomeAmount = (index: number): string => {
  const cents = 100000 + ((index * 28111) % 500001);
  return centsToAmount(cents);
};

async function main() {
  console.log("Starting seed...");

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: DEMO_EMAIL },
        { clerkId: DEMO_CLERK_ID },
      ],
    },
    select: { id: true, email: true, clerkId: true },
  });

  if (existingUser) {
    console.log(
      `Refreshing seeded data for ${existingUser.email} (${existingUser.clerkId})`,
    );

    await prisma.transaction.deleteMany({
      where: { userId: existingUser.id },
    });

    await prisma.invoice.deleteMany({
      where: { userId: existingUser.id },
    });

    await prisma.auditLog.deleteMany({
      where: { userId: existingUser.id },
    });
  }

  const user = await prisma.user.upsert({
    where: { clerkId: DEMO_CLERK_ID },
    update: {
      email: DEMO_EMAIL,
      companyName: DEMO_COMPANY_NAME,
      plan: DEMO_PLAN,
    },
    create: {
      clerkId: DEMO_CLERK_ID,
      email: DEMO_EMAIL,
      companyName: DEMO_COMPANY_NAME,
      plan: DEMO_PLAN,
    },
  });

  console.log(`Seed user ready: ${user.email}`);

  const today = new Date();

  for (let i = 0; i < 24; i++) {
    const monthsAgo = Math.floor(i / 2);
    const daysOffset = i % 2 === 0 ? 5 : 20;
    const recordDate = subDays(subMonths(today, monthsAgo), daysOffset);

    const vendor = VENDORS[i % VENDORS.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const amount = buildExpenseAmount(i);
    const vatAmount = new Decimal(amount).mul(0.19).toFixed(2);
    const status =
      i % 5 === 0 ? InvoiceStatus.NEEDS_REVIEW : InvoiceStatus.COMPLETED;

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        vendorName: vendor,
        amount,
        vatAmount,
        vatRate: VATRate.NINETEEN,
        currency: "EUR",
        status,
        fileUrl: `https://example.com/invoices/fake_${i}.pdf`,
        extractedAt: recordDate,
        createdAt: recordDate,
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: AuditEntityType.INVOICE,
        entityId: invoice.id,
        action: AuditAction.CREATE,
        userId: user.id,
        ipAddress: "seed-script",
        newValue: {
          userId: invoice.userId,
          vendorName: invoice.vendorName,
          amount: invoice.amount,
          vatAmount: invoice.vatAmount,
          vatRate: invoice.vatRate,
          currency: invoice.currency,
          status: invoice.status,
          fileUrl: invoice.fileUrl,
          extractedAt: invoice.extractedAt?.toISOString() ?? null,
          createdAt: invoice.createdAt.toISOString(),
        },
      },
    });

    const transaction =
      status === InvoiceStatus.COMPLETED
        ? await prisma.transaction.create({
            data: {
              userId: user.id,
              invoiceId: invoice.id,
              description: `Payment to ${vendor}`,
              amount,
              type: TransactionType.EXPENSE,
              category,
              date: recordDate,
            },
          })
        : await prisma.transaction.create({
            data: {
              userId: user.id,
              description: `Client Payment - Project ${i + 1}`,
              amount: buildIncomeAmount(i),
              type: TransactionType.INCOME,
              category: "Client Revenue",
              date: recordDate,
            },
          });

    await prisma.auditLog.create({
      data: {
        entityType: AuditEntityType.TRANSACTION,
        entityId: transaction.id,
        action: AuditAction.CREATE,
        userId: user.id,
        ipAddress: "seed-script",
        newValue: {
          userId: transaction.userId,
          invoiceId: transaction.invoiceId,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date.toISOString(),
        },
      },
    });
  }

  if (DEMO_CLERK_ID === "seed_demo_clerk_id") {
    console.warn(
      "Seeded with fallback clerkId. Set SEED_CLERK_ID to your real Clerk user ID if you want the seeded data tied to your login.",
    );
  }

  console.log("Seeding finished.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

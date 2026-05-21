import { PrismaClient, VATRate, InvoiceStatus, TransactionType } from "@prisma/client";
import { subMonths, subDays } from "date-fns";

const prisma = new PrismaClient();

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
  "Vodafone GmbH"
];

const CATEGORIES = [
  "Office Supplies",
  "Telecommunication",
  "Hardware",
  "Cloud Infrastructure",
  "Travel",
  "Software Licenses",
  "Utilities",
  "Insurance"
];

async function main() {
  console.log("Starting seed...");

  // Clean up existing data to prevent duplicates on multiple runs
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Demo User
  const user = await prisma.user.create({
    data: {
      clerkId: "demo_user_clerk_id_123", // Matches a placeholder or demo
      email: "demo@finflow-app.de",
      companyName: "Musterfirma GmbH",
      plan: "PRO",
    },
  });

  console.log(`Created user: ${user.email}`);

  // 2. Generate 24 Invoices & Transactions (Past 12 months, ~2 per month)
  const today = new Date();
  
  for (let i = 0; i < 24; i++) {
    // Distribute dates across the last 12 months
    const monthsAgo = Math.floor(i / 2);
    const daysOffset = (i % 2 === 0) ? 5 : 20; // 5th and 20th of the month
    const recordDate = subDays(subMonths(today, monthsAgo), daysOffset);

    const vendor = VENDORS[i % VENDORS.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    
    // Generate random amount between 50.00 and 2500.00
    const rawAmount = (Math.random() * 2450 + 50).toFixed(2);
    // 19% VAT Calculation
    const vatAmount = (parseFloat(rawAmount) * 0.19).toFixed(2);
    
    // Mix statuses
    const status = i % 5 === 0 ? InvoiceStatus.NEEDS_REVIEW : InvoiceStatus.COMPLETED;

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        vendorName: vendor,
        amount: rawAmount,
        vatAmount: vatAmount,
        vatRate: VATRate.NINETEEN,
        currency: "EUR",
        status: status,
        fileUrl: `https://example.com/invoices/fake_${i}.pdf`,
        extractedAt: recordDate,
        createdAt: recordDate,
      },
    });

    // Create corresponding transaction if invoice is completed
    if (status === InvoiceStatus.COMPLETED) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          invoiceId: invoice.id,
          description: `Payment to ${vendor}`,
          amount: rawAmount, // using the same raw string amount
          type: TransactionType.EXPENSE,
          category: category,
          date: recordDate,
        },
      });
    } else {
      // Create some income transactions occasionally instead
      await prisma.transaction.create({
        data: {
          userId: user.id,
          description: `Client Payment - Project ${i}`,
          amount: (Math.random() * 5000 + 1000).toFixed(2),
          type: TransactionType.INCOME,
          category: "Client Revenue",
          date: recordDate,
        },
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

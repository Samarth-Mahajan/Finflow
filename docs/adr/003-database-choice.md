# 003 Database Choice

## Context
FinFlow stores user, invoice, transaction, and append-only audit data with strong consistency expectations. Financial records need relational integrity, query flexibility for reporting, and a mature ecosystem for schema evolution, backups, and compliance-oriented operational practices.

## Decision
We will use PostgreSQL with Prisma as the primary persistence layer. PostgreSQL gives us transactions, reliable indexing, JSON support for audit snapshots, and a strong fit for the relational shape of invoices, transactions, and user ownership boundaries.

## Consequences
The stack is slightly heavier than a document database, but it better supports reporting, joins, and future financial controls without awkward denormalization. Prisma adds typed access and developer ergonomics, while PostgreSQL provides the durability and modeling discipline expected in a fintech-oriented architecture.

# 001 Decimal Precision

## Context
FinFlow models invoices, VAT, and transaction totals for German SMEs, so even small rounding errors would undermine trust in the product and weaken the portfolio's architectural credibility. JavaScript `number` values use binary floating-point arithmetic, which is fast but can produce imprecise results for decimal fractions such as `0.1 + 0.2`.

## Decision
We will use Decimal.js for every monetary calculation and persist money values as strings that can be converted back into `Decimal` objects at the domain layer. This keeps arithmetic deterministic across VAT calculation, invoice extraction review, reporting, and audit-related comparisons.

## Consequences
Developers must avoid native float math in any financial path and convert external numeric input into `Decimal` before use. The code is slightly more explicit, but we gain correct rounding behavior, safer reconciliation logic, and clearer documentation of financial intent.

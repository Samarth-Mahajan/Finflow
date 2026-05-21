# 002 Queue Architecture

## Context
Invoice extraction and AI-assisted processing are latency-sensitive but not always user-blocking. A synchronous request cycle would couple uploads to OpenAI and parsing work, making retries, backpressure handling, and operational visibility much harder as document volume grows.

## Decision
We will use BullMQ backed by Redis for background processing of invoice extraction and related AI jobs. BullMQ gives us durable queues, retry policies, delayed jobs, and clear worker separation that fits a fintech SaaS where traceability and failure recovery matter as much as throughput.

## Consequences
This adds Redis and worker operational overhead, but it keeps the web layer responsive and makes processing pipelines easier to scale independently. It also gives us a clean foundation for status transitions such as `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, and `NEEDS_REVIEW`.

---
slug: distributed-payment-gateway
name: Distributed Payment Gateway
status: building          # in flight
type: personal            # independent project, NOT production and NOT a real bank integration
category: system design
featured: true
rank: 2
role: Backend and distributed-systems engineer
team_size: 1
stack: [Java 21, Spring Boot, Kafka, PostgreSQL, Redis, Zookeeper, Spring Cloud Gateway, Resilience4j, Spring Batch, Flyway, Gradle, Docker Compose, Newman]
links:
  github: https://github.com/Prateesh-Sulikeri/distributed-payment-gateway
  project_page: https://prateesh-sulikeri-portfolio.vercel.app/projects/distributed-payment-gateway
---

# Overview

A payment platform built from scratch to learn distributed systems properly. It has six Spring Boot services on Java 21, each owning its own database and communicating over Kafka instead of HTTP. It does asynchronous payment orchestration with a transactional outbox, Kafka-persisted retries, dead-letter topics, and webhook delivery that knows when to give up.

It is an independent engineering project, not a production payment platform. It handles no real traffic and has no real bank integrations.

# Why payments

Payments are a strong reason to build a distributed system correctly. Money can't be lost or charged twice. The failure modes (bank timeouts, a consumer crashing mid-message, a merchant callback going dark) all need correct handling, not just happy-path code.

# Services

| Service | Port | Job |
|---|---|---|
| payment-service | 8080 | The only service clients call directly |
| mock-bank-service | 8081 | Simulates the card networks |
| merchant-service | 8082 | Merchant registration and API keys |
| webhook-service | 8083 | Delivers notifications to merchants |
| settlement-service | 8084 | Runs the nightly settlement batch |
| gateway-service | 9000 | The single entry point |

Each service that stores data has its own Postgres instance, so there are four separate databases. A shared database would let a join across a service boundary slip in unnoticed.

# The payment flow is asynchronous

1. `POST /payments` returns `202 Accepted` and writes a PENDING row. The client polls `GET /payments/{id}`.
2. The state machine is PENDING → SUCCESS → SETTLED, driven by three Kafka topics: `payment.initiated`, `payment.processed` and `payment.succeeded`.
3. The mock bank behaves differently per payment method:
   - **Card:** 85% success, 200–500 ms latency. Failures include CVV mismatch and insufficient funds.
   - **UPI:** 92% success, 50–150 ms. Failures include the daily limit being exceeded.
   - **Net banking:** 78% success, 1–3 s. Failures include bank timeout and session expiry.
4. A strategy-pattern `PaymentRouter` means adding a payment method doesn't require editing a switch statement.

Why asynchronous: holding an HTTP connection open for seconds per payment is exactly the coupling Kafka exists to remove.

# Transactional outbox, and the lock it needed

**The problem:** "save to the database, then publish to Kafka" isn't one transaction. A crash between the two loses the event (the dual-write problem).

**The fix:** payment-service writes the payment row and an outbox row in the same database transaction. A scheduled publisher picks up PENDING outbox events every 5 seconds and publishes them to Kafka. If Kafka is down, the event stays PENDING and is retried on the next tick, so durability comes from Postgres.

**The next problem:** two payment-service instances would both publish the same rows.

**The fix:** a distributed lock built on Postgres row locking. The lock is a Postgres table row keyed by the lock name. Acquiring the lock is an insert, and a `DataIntegrityViolationException` means another instance holds it. Expired locks are reclaimed by whichever instance notices first, so a dead instance can't block publishing forever.

# Retries live in Kafka, not in memory

- **Retry policy:** every consumer uses `@RetryableTopic`: 3 attempts, a 2-second delay, a 2× backoff multiplier, then a `.DLT` dead-letter topic.
- **Why Kafka holds the retries:** an in-memory retry loop is lost if the process dies mid-backoff. With `@RetryableTopic`, each attempt is a Kafka record, so a crash mid-retry resumes where it left off.
- **Idempotent consumers:** delivery is at-least-once, so every consumer tolerates duplicates. For example, the processed-event consumer only moves a payment that's still PENDING and ignores the event otherwise.
- **Topics are provisioned, not auto-created:** auto-creation is off (`KAFKA_AUTO_CREATE_TOPICS_ENABLE=false`). An idempotent Python script, run as a one-shot container, creates the topics, so a misspelled topic name fails loudly.

# Webhook delivery, and giving up gracefully

webhook-service consumes `payment.processed` and POSTs to the merchant's callback URL.

- **Retries:** a 2xx response marks the delivery as done. Anything else retries with exponential backoff (30 s, 60 s, 120 s, 240 s). After 5 failures the delivery is marked DEAD.
- **Manual recovery:** dead deliveries can be queried and retried by hand through an admin endpoint.
- **Isolation:** a Resilience4j circuit breaker (5-call window, 50% failure threshold, 15 s open, automatic half-open) plus a 5-second time limiter mean one hanging merchant endpoint can't starve the retry worker. A second circuit breaker guards payment-service's Kafka producer.

# Settlement

settlement-service consumes `payment.succeeded`. A Spring Batch job runs on a midnight cron, aggregates unsettled successful payments per merchant, writes a settlement record, and marks those payments SETTLED. It's idempotent on rerun, because a non-idempotent settlement job could pay a merchant twice.

Being honest about it: it's a single Tasklet that processes every aggregate in one step, not the chunk-oriented reader/processor/writer the design called for. That's fine now but won't hold as the number of merchants grows.

# What's built and what isn't

**Built:** the five business services, verified end to end with Newman against a live `docker compose up` stack. The stack runs 4 Postgres instances, Redis, Zookeeper and Kafka with a dual-listener setup, with healthcheck-gated startup ordering.

**Not built yet:**

- **Observability (the current phase):** Actuator exposes `/prometheus`, but `micrometer-registry-prometheus` isn't on the classpath, so it doesn't return Prometheus metrics yet. There's no Zipkin tracing and no Grafana dashboards.
- **Gateway:** it's a plain path-prefix reverse proxy. Per-merchant rate limiting is designed but not implemented.
- **Deployment (a plan, not done):** the target is a single EC2 instance, with the four Postgres containers collapsed into one RDS instance, Kafka self-hosted (MSK isn't free-tier eligible), and `.env` replaced by Parameter Store.
- **A known auth gap (documented, not yet patched):** the API-key filter validates a key when an Authorization header is present but fails open when it's missing. The planned fix is gateway authentication plus a dedicated auth service.

# What he got out of it

The hard part was the seams: the gap between a database commit and a Kafka publish, between "container started" and "service ready", and between retrying and giving up. The Kafka wiring itself was mostly configuration.

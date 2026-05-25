# Event Data Transformer — Brainstorm & Roadmap

## What is this?

A runtime-configurable Kafka pipeline that:
1. Listens to an input Kafka topic (consumer created at runtime)
2. Applies transformation rules to each message (field exclusions, date reformats, renames, etc.)
3. Publishes the transformed message to an output Kafka topic (producer created at runtime)

All pipeline configurations are stored in MySQL and can be created/updated/deleted via REST API **without restarting the app**.

---

## Architecture Overview

```
REST API (CRUD configs)
        ↓
  MySQL (consumer configs + transformer configs)
        ↓
Dynamic Consumer Manager
        ↓  (raw JSON message, fanned out)
   ┌────┴────┬──────────┐
   ↓         ↓          ↓
Transform  Transform  Transform   ← each with its own rules
   ↓         ↓          ↓
Producer  Producer   Producer
   ↓         ↓          ↓
 topicA    topicB     topicC
```

One consumer on an `inputTopic` fans out to N transformers,
each transformer produces to its own `outputTopic`.

---

## Core Concepts

### Consumer
Represents a single Kafka consumer (one input topic).
- `id`, `name`
- `inputTopic`
- `groupId` — Kafka consumer group
- `enabled`
- list of `Transformer` (the fan-out targets)

### Transformer
One branch of the fan-out. Belongs to a Consumer.
- `id`, `name`
- `outputTopic` — where this branch publishes
- `enabled` — can disable a single branch without touching others
- ordered list of `TransformationRule`

### TransformationRule
A single operation applied to the message within a Transformer. Types:
- `EXCLUDE_FIELD` — drop a field entirely
- `RENAME_FIELD` — rename a key
- `FORMAT_DATE` — reformat a date string from one pattern to another
- `MAP_VALUE` — replace a field value based on a lookup map
- *(more can be added later)*

### Hot-reload
When a consumer or transformer config changes via API:
- Stop the existing consumer container for that consumer
- Reload all its transformers + rules from DB
- Restart the consumer container

---

## Current File Structure

```
src/main/java/com/project/event_data_transformer/
├── config/
│   └── KafkaConfig.java              — ConsumerFactory, ProducerFactory, KafkaTemplate beans
├── consumer/
│   ├── KafkaConsumerConfig.java      — JPA entity (id, name, inputTopic, groupId, enabled)
│   ├── KafkaConsumerConfigRepository.java — findAllByEnabledTrue()
│   ├── ConsumerService.java          — create/stop/delete, starts consumer via DynamicConsumerManager
│   └── ConsumerBootstrapper.java     — ApplicationRunner: loads enabled consumers from DB on startup
└── kafka/
    ├── DynamicConsumerManager.java   — creates/starts/stops ConcurrentMessageListenerContainer at runtime
    └── ConsumerController.java       — POST /consumers, POST /consumers/{id}/stop, DELETE /consumers/{id}
                                        POST /consumers/test-send (for manual testing)
```

---

## Feature Steps

### Step 1 — Consumer Layer ✅ DONE
- [x] `KafkaConsumerConfig` entity (`id`, `name`, `inputTopic`, `groupId`, `enabled`)
- [x] `KafkaConsumerConfigRepository` with `findAllByEnabledTrue()`
- [x] `ConsumerService` — create (saves to DB + starts), stop (disables in DB + stops), delete
- [x] `DynamicConsumerManager` — runtime `ConcurrentMessageListenerContainer` management
- [x] `ConsumerBootstrapper` — on startup, load all enabled consumers from DB and start them
- [x] `ConsumerController` — REST endpoints wired to service
- [x] Kafka + MySQL in Docker Compose (KRaft mode, no Zookeeper)

### Step 2 — Transformer & Rule Data Model
- [ ] `TransformerConfig` entity (`id`, `name`, `outputTopic`, `enabled`, `consumerId` FK)
- [ ] `TransformationRule` entity (`id`, `transformerId` FK, `order`, `type` enum, `fieldName`, `params` JSON column)
- [ ] `TransformerConfigRepository`, `TransformationRuleRepository`
- [ ] Add `@OneToMany` from `KafkaConsumerConfig` → `TransformerConfig`
- [ ] Add `@OneToMany` from `TransformerConfig` → `TransformationRule`
- [ ] REST API:
  - `POST /consumers/{id}/transformers` — add transformer to consumer
  - `PUT /transformers/{id}`, `DELETE /transformers/{id}`
  - `POST /transformers/{id}/rules` — add rule
  - `PUT /rules/{id}`, `DELETE /rules/{id}`
  - Enable/disable toggle for transformer independently of consumer

### Step 3 — Transformation Engine
- [ ] `RuleType` enum: `EXCLUDE_FIELD`, `RENAME_FIELD`, `FORMAT_DATE`, `MAP_VALUE`
- [ ] Interface `RuleApplier` with `apply(ObjectNode message, TransformationRule rule): ObjectNode`
- [ ] Implement one class per rule type
- [ ] `TransformationEngine` — given a message and a list of ordered rules, applies them in sequence
- [ ] Use Jackson `ObjectNode` as the internal message format (JSON in, JSON out)
- [ ] Unit tests per rule type

### Step 4 — Dynamic Producer + Wire Fan-out
- [ ] `DynamicProducerManager` — similar to consumer manager, creates/caches `KafkaTemplate` per output topic
- [ ] Update `DynamicConsumerManager` so on each received message it:
  1. Loads all enabled `TransformerConfig`s for that consumer
  2. For each: runs `TransformationEngine`, then sends result via `DynamicProducerManager` to `outputTopic`
- [ ] The fan-out should be independent per transformer (one failing branch must not block others)
- [ ] Hot-reload: when a transformer/rule changes, restart only the affected consumer container

### Step 5 — Observability
- [ ] Log each message received / per-transformer result / sent (already have basic logging)
- [ ] Expose basic metrics (messages processed, errors per consumer/transformer) via Spring Actuator
- [ ] `GET /consumers/{id}/status` — returns running/stopped + message count

---

## Open Questions
- Message format: assume JSON only for now? → **Yes, JSON only for now**
- Error handling: dead-letter topic on transformation failure?
- Auth on the REST API?
- Consumer group ID strategy — one per consumer config? Configurable? → **Currently configurable via groupId field**

---

## Tech Stack
- Java 25, Spring Boot 4.x
- Spring Kafka (dynamic `ConcurrentMessageListenerContainer`)
- Spring Data JPA + MySQL 8.4
- Lombok
- Docker Compose (MySQL + Kafka apache/kafka:3.9.0 KRaft)

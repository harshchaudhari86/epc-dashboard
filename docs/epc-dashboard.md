## EPC Automation Platform Overview

This document captures the end-to-end vision for the Engineering, Procurement, and Construction (EPC) dashboard, the supporting services, and the human + AI collaboration model.

---

## Objectives
- Discover and ingest new tenders daily from public portals, internal feeds, or manual submissions.
- Parse and understand tender documents automatically so they appear as actionable work items.
- Provide a single dashboard where teams collaborate with specialized AI agents to assemble bids.
- Keep agents autonomous but reviewable—humans verify checkpoints, correct issues, and approve submissions.
- Offer API + WebSocket interfaces so downstream tools (UI, chat, integrations) stay in sync in real time.

---

## High-Level Workflow
1. **Discovery:** Scheduled crawlers and API connectors pull tenders, notices, and manual leads into the intake queue.
2. **Document Handling:** Files are downloaded, virus-scanned, OCR’d, and parsed for metadata, BOQ items, clauses, and risk signals.
3. **Tender Creation:** Parsed insights materialize into a `Tender` record with linked documents, tasks, and initial risk assessments.
4. **Agent Collaboration:** Functional agents (procurement, engineering, legal, etc.) spin up sessions, plan tasks, and coordinate with assigned human teams through WebSockets.
5. **Bid Assembly:** Agents co-author pricing sheets, compliance forms, and narratives; humans review and lock the final bid package.
6. **Submission & Tracking:** Final artifacts, approvals, and submission proofs are stored; status rolls forward to `Submitted` and post-mortem metrics are collected.

---

## System Architecture
### 1. Ingestion Layer
- **Sources:** GeM, CPPP, state portals, RSS, email drops, partner APIs, manual uploads.
- **Execution:** Temporal/Airflow jobs trigger headless scrapers or API requests once per day (or on demand).
- **Output:** Normalized `TenderLead` events pushed to `tenders.discovery` topic (Kafka/PubSub) for downstream consumers.

### 2. Document Processing Pipeline
- **Services:** `document-fetcher`, `document-parser`, `doc-insight`.
- **Steps:** Download → checksum/AV scan → OCR (if scanned) → NLP extraction (titles, clauses, BOQ, deadlines) → embeddings for semantic search.
- **Storage:** 
  - Binary assets in S3/GCS (`documents/{tenderId}/...`).
  - Metadata + extracted entities in Postgres.
  - Vector index (Pinecone/Qdrant/OpenSearch) for retrieval.

### 3. Tender Lifecycle Service
- REST/GraphQL API for CRUD on tenders, tasks, documents, comments.
- Handles status transitions (`New → Estimation → Review → Submitted`).
- Enforces RBAC and audit logging.
- Emits domain events (`tender.updated`, `task.completed`) consumed by UI and agents.

### 4. AI Agent Platform
- Multi-agent orchestrator (LangGraph/AutoGen/CrewAI) hosting:
  - **ProcurementAgent:** vendor DB, pricing benchmarks, RFQ workflows.
  - **EngineeringAgent:** spec libraries, structural calculators, BOQ optimizer.
  - **LegalAgent:** clause repository, risk templates, compliance checklists.
  - Additional personas as needed (finance, planning, QA).
- Each agent has access to tool adapters (HTTP clients, DB queries, document retrieval).
- State stored in Redis/Postgres; long-term knowledge in vector store.

### 5. Realtime Collaboration Layer
- WebSocket gateway (`wss://api/.../stream`) with channels:
  - `tender:{id}` for workbench events.
  - `agent:{id}` for session updates.
  - `team:{function}` for broadcast notices (procurement, engineering, etc.).
- Payloads include agent status, task progress, human comments, AI recommendations.
- Supports human commands (pause agent, approve output, request revision).

### 6. Frontend Dashboard
- Next.js + Tailwind UI (current repo) displaying:
  - Command Center KPIs and tender pipeline.
  - Tender Workbench tabs (Smart BOQ, Documents & Risk, Subcontractors, Agent Console).
  - Real-time agent/human conversation feed via WebSocket.

---

## API Surface (MVP)
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/tenders` | Manual intake of a new tender lead. |
| `GET` | `/tenders?status=...` | List tenders filtered by status/owner/risk. |
| `GET` | `/tenders/{id}` | Fetch tender details, documents, tasks, agents. |
| `POST` | `/tenders/{id}/status` | Transition tender workflow state. |
| `POST` | `/tenders/{id}/documents` | Upload additional docs or revised BOQs. |
| `GET` | `/tenders/{id}/agents` | List agent sessions and statuses. |
| `POST` | `/tenders/{id}/agents/{agentId}/commands` | Send commands (approve, request changes, pause). |
| `GET` | `/vendors` | List approved vendors and packages. |
| `POST` | `/vendors/{id}/quotes` | Capture vendor quote submissions. |

**WebSockets:** `wss://api.example.com/stream?channel=tender:{id}` streaming JSON events (agent updates, task changes, chat messages).

---

## Data Model Snapshot
- `Tender`: id, title, client, value_estimate, deadline, status, owner_id, risk_score.
- `Document`: id, tender_id, type, storage_path, checksum, parsed_status.
- `ExtractedEntity`: id, document_id, entity_type (`clause`, `boq_item`, `deadline`), payload JSON.
- `AgentSession`: id, tender_id, agent_type, status, last_message, assigned_team.
- `Task`: id, tender_id, assigned_to (agent/human), description, due_at, status, audit trail.
- `VendorQuote`: id, tender_id, vendor_id, package_name, amount, status, l1_flag.

---

## Operational & Security Considerations
- **RBAC:** Separate roles for procurement, engineering, legal, leadership.
- **Audit Trails:** Log every agent action, human override, and document change.
- **Document Security:** Encrypt at rest/in transit; sensitive tenders isolated per tenant.
- **Monitoring:** Alert on ingestion failures, agent errors, missed deadlines.
- **Compliance:** Retain submitted bid packages, signed documents, and communication history.

---

## Roadmap / Next Steps
1. Finalize source list, crawling cadence, and legal considerations for each portal.
2. Define canonical data schema + API contracts (OpenAPI/GraphQL schema).
3. Stand up ingestion + document processing infrastructure (cloud functions + queue).
4. Implement Tender Lifecycle service with RBAC, events, and WebSocket gateway.
5. Integrate AI agent framework with tool plugins and human review UX.
6. Pilot with internal tenders, collect feedback, iterate on workflows and UI.

---

## Sharing & Collaboration
- Save this doc as part of the repo (`docs/epc-dashboard.md`) so everyone can review.
- Use it as a living design doc—update sections as architecture decisions evolve.


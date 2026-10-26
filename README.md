# 🕵️ Ms WebPilot — A Privacy-First Browser Agent

An intelligent browser automation agent that understands your screen, protects sensitive data locally, and executes browser tasks using AI reasoning — with long-term memory for relevant user preferences.

Ms WebPilot is a full-stack browser agent built for **Smart India Hackathon 2026** (Problem Statement ID: 26171 — On-device Visual Perception for Light-weight Browser Agents).

The system combines on-device perception and privacy protection with server-side AI reasoning. It sanitizes sensitive context before sending it to the reasoning layer and uses **Hindsight-powered long-term memory** to personalize future browser tasks using relevant saved preferences.

> **Core idea:** See locally. Protect sensitive data. Reason intelligently. Remember relevant preferences. Execute validated actions.

## 💻 Repository

- **GitHub:** https://github.com/aakashtripathi011/Ms-WebPilot
- **Status:** Prototype under active development — not yet deployed
- **Purpose:** SIH 2026, educational use, and project demonstrations

## ✨ Features

### 🔐 Privacy Firewall

- Local PII detection for emails, phone numbers, government IDs, and card numbers.
- Face detection and blurring.
- Password and credential masking.
- Redaction metadata generation for server-side awareness.
- A privacy layer designed to sanitize sensitive information before AI reasoning.

### 👁️ Local Visual Perception

- On-device browser understanding using a lightweight vision model.
- WebGPU-based inference where supported.
- Browser page-state and visual context collection.
- A privacy-conscious perception pipeline designed to avoid sending unprotected raw screenshots to the reasoning service.

### 🧠 AI-Powered Reasoning

- Uses a server-side vision-language model to select the next browser action.
- Integrates with OpenRouter for model access.
- Supports a configurable model-selection and fallback strategy.
- Produces structured action responses instead of directly executing arbitrary model-generated code.

### 🧩 Hindsight Long-Term Memory

Ms WebPilot integrates **Hindsight**, a long-term memory system powered by Vectorize, to make browser automation more personalized across separate tasks.

The agent can save an explicitly provided user preference, retrieve relevant memories for a new task, and provide those memories to the AI reasoning layer as contextual information.

Key capabilities:

- **Explicit memory saving:** Users can ask WebPilot to remember a preference.
- **Contextual recall:** Relevant memories are retrieved when a browser task is processed.
- **Personalized search:** The reasoning model can use relevant saved preferences to refine browser search queries.
- **Memory-aware reasoning:** Retrieved memories are included in the model prompt as contextual information, not as instructions that override the current task.
- **Dashboard visibility:** A Memory Activity panel displays memory-related events, including saves, recalls, retrieval counts, and errors.
- **Graceful failure handling:** Memory operations are designed to handle failures without unnecessarily crashing the agent workflow.

#### Example: Preference-Based Browser Search

Suppose a user tells WebPilot:

`Remember that I like Bella Vita CEO Man perfume.`

Later, in a separate task, the user asks:

`Find a good Bella Vita men's perfume for me on Amazon.`

WebPilot can retrieve the saved preference and use it to personalize the search toward **Bella Vita CEO Man** rather than performing only a generic product search.

This demonstrates how long-term memory can make browser automation more context-aware across separate tasks.

### ✅ Action Validation

- AI-generated browser actions are checked by the Action Validator.
- Structured action validation helps reject malformed or unsupported actions.
- Browser actions are restricted to the supported action types and validation rules.
- The model's output is treated as a proposed action, not automatically trusted executable code.

### ⚡ Browser Automation

- Browser automation through a Chrome Manifest V3 extension.
- Executes supported actions such as clicking, typing, scrolling, and navigation.
- Uses Socket.IO for real-time communication between the extension and backend.
- Observes updated page state and continues the task loop.

### 🔄 Privacy-Preserving, Memory-Aware Agent Loop

Ms WebPilot combines perception, privacy protection, AI reasoning, action validation, execution, and long-term memory.

`SEE → PROTECT → RECALL → THINK → VALIDATE → ACT → OBSERVE → REPEAT`

The memory stage supplies relevant context when available. It does not replace the current user task or the action-validation layer.

## 🤖 How the Agent Works

| Stage | What happens |
|---|---|
| **See** | The extension captures the current browser state. |
| **Protect** | Local perception and privacy sanitization process the available context. |
| **Recall** | Hindsight retrieves potentially relevant long-term memories for the current task. |
| **Think** | The reasoning model uses the task, page state, action history, and relevant memories to select the next action. |
| **Validate** | The Action Validator checks the proposed action. |
| **Act** | The extension executes the validated action. |
| **Observe** | The extension captures the updated browser state. |
| **Repeat** | The agent continues until the task is complete or no safe next action exists. |

Memory recall is contextual: the system should use relevant preferences, not blindly apply every saved memory to every task.

## 🧠 Hindsight Memory Architecture

Hindsight provides the long-term memory layer, while the browser extension, backend, reasoning model, and dashboard handle the rest of the workflow.

### Memory lifecycle

1. **Capture a preference:** The user explicitly asks WebPilot to remember something.
2. **Save the memory:** The backend sends the preference to Hindsight through `backend/memory.js`.
3. **Start a future task:** The user submits a new browser automation task.
4. **Retrieve relevant context:** The backend calls Hindsight recall using the task and current page context.
5. **Pass context to the planner:** `backend/qwen.js` incorporates retrieved memories into the reasoning prompt.
6. **Personalize the next action:** The model uses relevant context when appropriate, while following the current user request.
7. **Display activity:** The dashboard receives memory activity updates through Socket.IO.

### Memory-related components

| Component | Responsibility |
|---|---|
| `backend/memory.js` | Hindsight client integration, memory retention, recall, connection testing, and sensitive-data checks. |
| `backend/server.js` | Receives tasks, coordinates memory operations, passes recalled memories to the planner, and emits memory activity events. |
| `backend/qwen.js` | Includes retrieved long-term memories in the AI reasoning prompt. |
| `dashboard/app/page.jsx` | Displays memory activity and the latest memory-related status. |
| Hindsight service | Stores and retrieves long-term memories through the configured Hindsight service. |

### Memory Activity Dashboard

The dashboard provides visibility into recent memory operations, including:

- **Saved:** A preference was successfully saved.
- **Recalled:** Relevant memories were retrieved for a task.
- **No memories:** No relevant memories were retrieved.
- **Error:** A memory operation failed or could not be confirmed.
- **Retrieval count:** The number of memories retrieved for the latest recall event.
- **Last updated:** The timestamp associated with the latest memory activity.

The dashboard status is an activity indicator, not a guarantee that every retrieved memory influenced the final action.

## 🛡️ Redaction Scheme

| Data type | Intended protection |
|---|---|
| Faces | Blurring |
| Passwords and credentials | Blacking out or masking |
| PII such as emails, phone numbers, IDs, and card numbers | Masking or redaction |
| Redaction metadata | Communicates which information was intentionally hidden |

The Privacy Firewall and Hindsight memory system have different responsibilities. The firewall protects sensitive browser context; Hindsight provides long-term memory. Memory content should be treated as untrusted context and should not override current instructions or security rules.

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Browser Extension  │
                         │     Chrome MV3       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     LOCAL PERCEPTION          │
                    │                               │
                    │  Browser State / Visual Input │
                    │               ↓               │
                    │       Privacy Firewall        │
                    │               ↓               │
                    │      Sanitized Context        │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       NODE.JS BACKEND         │
                    │                               │
                    │       Task Coordination      │
                    │               ↓               │
                    │       Hindsight Recall        │
                    │               ↓               │
                    │      AI Reasoning (Qwen)      │
                    │               ↓               │
                    │       Action Validator        │
                    └───────────────┬───────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
          ┌────────────────────┐      ┌────────────────────┐
          │ Hindsight Service  │      │ Browser Extension  │
          │ Long-Term Memory   │      │ Validated Actions  │
          └────────────────────┘      └─────────┬──────────┘
                                                │
                                                ▼
                                      ┌────────────────────┐
                                      │ Observe New State  │
                                      │ Continue Agent Loop│
                                      └────────────────────┘

                       Dashboard ← Socket.IO
                   Memory Activity / Agent Status
```

### Architecture overview

- **Client:** Browser extension captures browser state and runs the configured local perception and privacy-protection pipeline.
- **Privacy layer:** Sanitizes sensitive information before it is sent to the reasoning service.
- **Backend:** Coordinates tasks, memory retrieval, AI reasoning, and action validation.
- **Long-term memory:** Hindsight stores and retrieves relevant user preferences and past context.
- **Reasoning:** The configured model chooses the next browser action using the task, page state, action history, and relevant memories.
- **Execution:** The extension executes validated actions and observes the result.
- **Dashboard:** Shows agent status and memory activity.

## 🔄 Application Flow

### Example: Search for a Product

**Task:** `Search Amazon for a black bag`

1. The extension captures the current browser state.
2. The local privacy layer sanitizes available sensitive context.
3. The backend retrieves relevant memories, if any.
4. The reasoning model selects the next action.
5. The Action Validator checks the proposed action.
6. The extension executes the action.
7. The updated page state is observed.
8. The agent continues until the task is complete.

### Example: Personalized Search Using Memory

**First task — Save a preference**

`Remember that I like Bella Vita CEO Man perfume.`

The backend identifies the explicit memory request and asks Hindsight to retain the preference.

**Second task — Use the preference**

`Find a good Bella Vita men's perfume for me on Amazon.`

The backend recalls relevant memories and passes them to the reasoning model. When the saved preference is relevant, the model can use it to refine the search toward Bella Vita CEO Man.

This workflow has been demonstrated with a separate follow-up task that produced the expected personalized search.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A Chromium-based browser for the Chrome extension
- An OpenRouter API key for the configured reasoning models
- Hindsight service access and an API key
- A compatible local environment for the configured perception model

### 1. Clone the repository

```bash
git clone https://github.com/aakashtripathi011/Ms-WebPilot.git
cd Ms-WebPilot
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Use the project's existing package configuration and scripts. Start the backend using the command defined in `backend/package.json`.

### 3. Configure environment variables

Configure the required environment variables in the appropriate backend environment file.

```env
OPENROUTER_API_KEY=your_openrouter_api_key

HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=your_hindsight_service_url
HINDSIGHT_BANK_ID=your_hindsight_bank_id
```

Use the actual base URL and bank identifier provided by your Hindsight setup. The names above correspond to the variables used by the current integration.

**Security requirements:**

- Never commit `.env` files.
- Never put API keys in frontend code or browser-extension source.
- Do not share API keys in screenshots, logs, or demo recordings.
- Keep credentials out of Git history.

### 4. Install dashboard dependencies

From the repository root, enter the dashboard directory:

```bash
cd dashboard
npm install
```

Start the dashboard using the development script configured in `dashboard/package.json`.

### 5. Load the browser extension

1. Open the browser's extensions page.
2. Enable Developer Mode.
3. Choose the option to load an unpacked extension.
4. Select the extension directory containing the project's manifest.
5. Start the backend and dashboard as required by the project configuration.

Ensure the configured backend URL and extension permissions match your local environment.

### 6. Verify Hindsight connectivity

Use the existing memory connection test to verify that the backend can communicate with Hindsight.

Confirm that:

- The configured credentials and service URL are valid.
- A memory can be retained.
- A relevant memory can be recalled.
- The backend reports failures clearly when the service is unavailable.

Do not expose credentials when sharing test output.

> **Note:** This is a development prototype. Exact scripts, ports, model availability, and deployment configuration depend on the repository's current configuration.

## 🧪 Testing the Memory Workflow

A simple end-to-end demonstration can verify that long-term memory influences a future task.

1. Start the backend and load the browser extension.
2. Open the dashboard and verify that the backend connection is working.
3. Submit the task: `Remember that I like Bella Vita CEO Man perfume.`
4. Confirm that the dashboard reports the memory save event.
5. Start a separate task: `Find a good Bella Vita men's perfume for me on Amazon. Use my saved preferences to personalize the search.`
6. Observe the Hindsight recall event in the backend logs.
7. Verify that the resulting Amazon search reflects the saved preference.
8. Capture the dashboard and browser behavior for a project demonstration.

**Expected result:** The saved preference is retrieved during the later task and can influence the search query.

This is a demonstration of the implemented workflow, not a guarantee that every memory will be retrieved or that every task will be personalized correctly.

## 📊 Evaluation Metric Alignment

| Metric | Weight | Approach |
|---|---:|---|
| Accuracy of visual context | 25% | Local perception and browser-state context |
| PII detection recall/precision | 20% | Layered DOM, text sanitization, and face detection |
| Precision of redaction | 20% | Type-specific masking, blurring, and redaction |
| Client-side resource utilization | 20% | Lightweight local inference and supported acceleration |
| End-to-end latency | 15% | Perception, protection, reasoning, validation, and execution pipeline |

These are the target evaluation weights from the project requirements, not measured benchmark results. Long-term memory is an additional capability intended to improve contextual continuity and personalization.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Chrome Manifest V3 | Browser extension runtime |
| WebExtensions | Browser extension architecture |
| WebGPU | Local ML inference acceleration where supported |
| Transformers.js | In-browser model execution |
| ONNX Runtime Web | Browser-based ML inference where configured |
| Local vision model | On-device visual perception |
| DOM and text sanitization | Local sensitive-data detection and redaction |
| Face detection | Face detection and blurring |
| Node.js | Backend runtime |
| Express.js | REST API and server framework |
| Socket.IO | Real-time browser–server and dashboard communication |
| OpenRouter | Access to configured reasoning models |
| Qwen | AI reasoning through the configured model integration |
| Hindsight / Vectorize | Long-term memory retention and recall |
| JSON Schema / Action Validator | Structured action validation |
| Next.js and React | Dashboard interface |

## 🔒 Security and Privacy

Ms WebPilot is designed around a local privacy boundary and controlled browser execution.

- Sensitive browser context is processed by the local privacy pipeline before being sent to the reasoning service.
- Memory content is treated as contextual data, not trusted instructions.
- The current user request takes precedence over conflicting saved preferences.
- AI-generated actions pass through the Action Validator before execution.
- API keys and service credentials belong in environment variables, not source code.
- Memory retrieval and save failures should be handled without assuming that an operation succeeded.

### Important privacy considerations

Long-term memory introduces an additional data-handling responsibility. A saved preference may persist beyond the browser session, depending on the Hindsight service configuration.

Users should avoid storing passwords, authentication tokens, payment details, or other secrets as memories. The memory integration's sensitive-data checks are a safeguard, not a guarantee that every sensitive value will be detected.

The claim that browser data is protected must be understood in the context of the implemented local sanitization pipeline and its limitations; no automated redaction system can guarantee perfect detection of every sensitive value.

### Never commit

- `.env` files
- API keys or model gateway credentials
- Server secrets
- Raw user data captured during testing
- Sensitive memory content or credentials in logs and screenshots

## 🔭 Future Improvements

- Adaptive-resolution perception for better latency and accuracy.
- Broader PII detection, including multilingual text and handwritten fields.
- Expanded browser support and compatibility testing.
- On-device caching of frequent action patterns.
- Visual explainability for locally redacted content.
- Offline-first fallback reasoning.
- Expanded benchmarks for accuracy, recall, latency, and resource utilization.
- Improved memory relevance and retrieval evaluation.
- More explicit memory-management controls and deletion workflows.
- Better observability for memory failures and personalized-action decisions.
- Automated end-to-end regression tests for memory saving, recall, and browser execution.

## 🎯 Project Objective

Background AI agents are becoming increasingly common, but many agentic pipelines rely heavily on server-side processing, raising concerns about sensitive user data.

Ms WebPilot aims to bridge local and cloud environments by combining lightweight on-device perception and privacy protection with server-side AI reasoning.

Hindsight adds a long-term memory layer so relevant preferences can be carried across separate browser tasks instead of requiring users to repeat the same context.

The objective is to combine **privacy-conscious browser automation, validated actions, and context-aware personalization** in one extensible system.

## 🏆 Project Highlights

Ms WebPilot combines:

- On-device visual perception.
- A local privacy firewall for PII and face protection.
- Server-side AI reasoning using configurable models.
- Structured browser-action validation.
- Real-time communication through Socket.IO.
- Hindsight-powered long-term memory.
- Preference-aware browser search across separate tasks.
- A dashboard for agent and memory activity.
- A modular architecture intended to support further development.

## 📌 Project Status

🚧 **Under Active Development**

Ms WebPilot is a prototype built for SIH 2026, Problem Statement 26171. The project is being developed and evaluated through ongoing work on perception, privacy protection, browser automation, long-term memory, and end-to-end reliability.

## 📄 License

This project is currently intended for educational, hackathon, and project demonstration purposes. Refer to the repository for any applicable license information.

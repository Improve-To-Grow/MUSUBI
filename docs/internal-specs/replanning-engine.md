# Feature: Replanning Engine

**Feature ID**: FEAT-REPLAN-001
**Version**: 1.0.0
**Status**: Draft
**Created**: 2025-12-08
**Author**: MUSUBI SDD

---

## Overview

The replanning feature adds dynamic task replanning capability to MUSUBI's orchestration engine.
It allows agents to edit the task list dynamically during execution, so they can adapt when a step fails or a better path is found.

### Background

As described in the VentureBeat article "Vibe coding is dead: Agentic swarm coding is the new enterprise moat",
replanning capability is a key component of modern Agentic Swarm systems.
This feature was one of the main factors behind the Warp framework achieving a 75.8% score on SWE-bench.

### Goals

1. Enable dynamic plan revision during task execution
2. Automate alternative path generation on failure
3. Support multiple LLM platforms
4. Integrate with existing orchestration patterns

---

## Requirements

### REQ-REPLAN-001: Replanning Trigger Detection
**Type**: Event-Driven
**Priority**: P0 (Must Have)
**Pattern**: When [trigger], the system shall [action]

**Statement**:
When a task execution fails, times out, or encounters an unexpected state, the system shall detect the replanning trigger and initiate the replanning process.

**Acceptance Criteria**:
- [ ] AC-001: Detect task failure and fire ReplanTrigger.TASK_FAILED
- [ ] AC-002: Detect timeout and fire ReplanTrigger.TIMEOUT
- [ ] AC-003: Detect context change and fire ReplanTrigger.CONTEXT_CHANGED
- [ ] AC-004: Detect unreachable goal and fire ReplanTrigger.GOAL_UNREACHABLE
- [ ] AC-005: Handle human replanning request and fire ReplanTrigger.HUMAN_REQUEST

---

### REQ-REPLAN-002: Dynamic Task List Modification
**Type**: Ubiquitous
**Priority**: P0 (Must Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall provide APIs to dynamically add, remove, reorder, and modify tasks in the execution plan during runtime.

**Acceptance Criteria**:
- [ ] AC-001: Tasks can be added at any position with `addTask(task, position)`
- [ ] AC-002: Tasks can be removed with `removeTask(taskId)`
- [ ] AC-003: Task order can be changed with `reorderTasks(taskIds)`
- [ ] AC-004: Task content can be changed with `modifyTask(taskId, updates)`
- [ ] AC-005: Change history is recorded in the plan history
- [ ] AC-006: Running tasks cannot be modified (only pending/completed can be modified)

---

### REQ-REPLAN-003: Alternative Path Generation
**Type**: Event-Driven
**Priority**: P0 (Must Have)
**Pattern**: When [trigger], the system shall [action]

**Statement**:
When a task fails and retry is exhausted, the system shall generate alternative execution paths using LLM to achieve the original goal.

**Acceptance Criteria**:
- [ ] AC-001: Analyze the context of the failed task
- [ ] AC-002: Generate alternative tasks that preserve the original goal
- [ ] AC-003: Generate multiple alternative path candidates (up to 3)
- [ ] AC-004: Calculate the estimated success probability of each alternative path
- [ ] AC-005: Automatically select the best alternative path or present it to a human

---

### REQ-REPLAN-004: LLM Provider Abstraction
**Type**: Ubiquitous
**Priority**: P0 (Must Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall provide a unified LLM interface that abstracts platform-specific LLM APIs (GitHub Copilot LM API, Anthropic, OpenAI, etc.).

**Acceptance Criteria**:
- [ ] AC-001: Define the `LLMProvider` interface
- [ ] AC-002: Implement the GitHub Copilot LM API provider
- [ ] AC-003: Implement the Anthropic Claude API provider
- [ ] AC-004: Implement the OpenAI API provider
- [ ] AC-005: The provider to use can be configured via environment variables or project.yml
- [ ] AC-006: A fallback provider can be configured

---

### REQ-REPLAN-005: Plan Evaluation
**Type**: State-Driven
**Priority**: P1 (Should Have)
**Pattern**: While [state], the system shall [action]

**Statement**:
While a plan is executing, the system shall continuously evaluate plan progress and determine if replanning is beneficial.

**Acceptance Criteria**:
- [ ] AC-001: Evaluate progress after each task completes
- [ ] AC-002: Estimate the remaining effort to reach the goal
- [ ] AC-003: Fire `BETTER_PATH_FOUND` when a more efficient path is found
- [ ] AC-004: Record evaluation results as metrics

---

### REQ-REPLAN-006: Swarm Pattern Integration
**Type**: Ubiquitous
**Priority**: P1 (Should Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall integrate replanning capabilities with the existing SwarmPattern to enable dynamic task modification during parallel execution.

**Acceptance Criteria**:
- [ ] AC-001: ReplanningEngine can be used from SwarmPattern
- [ ] AC-002: Add alternative tasks when a task fails during parallel execution
- [ ] AC-003: Dynamically update the dependency graph
- [ ] AC-004: Pass results of completed tasks on to new tasks

---

### REQ-REPLAN-007: Sequential Pattern Integration
**Type**: Ubiquitous
**Priority**: P1 (Should Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall integrate replanning capabilities with the existing SequentialPattern to enable step skip, insertion, and modification.

**Acceptance Criteria**:
- [ ] AC-001: ReplanningEngine can be used from SequentialPattern
- [ ] AC-002: Skip a failed step or insert an alternative
- [ ] AC-003: Dynamic evaluation of conditional steps
- [ ] AC-004: Maintain state handover between steps

---

### REQ-REPLAN-008: Workflow Orchestrator Integration
**Type**: Ubiquitous
**Priority**: P1 (Should Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall integrate replanning capabilities with the WorkflowOrchestrator to enable checkpoint-based replanning and workflow recovery.

**Acceptance Criteria**:
- [ ] AC-001: Start replanning from a checkpoint
- [ ] AC-002: Dynamic modification of workflow definitions
- [ ] AC-003: Generate alternatives for sub-workflows
- [ ] AC-004: Persist and restore workflow state

---

### REQ-REPLAN-009: Replanning History and Audit
**Type**: Ubiquitous
**Priority**: P2 (Nice to Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall maintain a complete history of all replanning decisions for audit, debugging, and learning purposes.

**Acceptance Criteria**:
- [ ] AC-001: Record replanning events with timestamps
- [ ] AC-002: The original plan and the revised plan can be compared
- [ ] AC-003: Record the reason for replanning
- [ ] AC-004: Can be exported in JSON/Markdown format
- [ ] AC-005: Aggregate metrics (replanning count, success rate, etc.)

---

### REQ-REPLAN-010: Human-in-the-Loop Replanning
**Type**: Optional
**Priority**: P2 (Nice to Have)
**Pattern**: Where [condition], the system shall [action]

**Statement**:
Where replanning involves high-risk changes or low-confidence alternatives, the system shall present options to the human operator for approval.

**Acceptance Criteria**:
- [ ] AC-001: The confidence threshold is configurable (default: 0.7)
- [ ] AC-002: Alternative paths at or below the threshold require human approval
- [ ] AC-003: Pause the workflow while awaiting approval
- [ ] AC-004: Provide approve/reject/modify options
- [ ] AC-005: Automatic handling on timeout is configurable

---

### REQ-REPLAN-011: CLI Integration
**Type**: Ubiquitous
**Priority**: P1 (Should Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall provide CLI commands for replanning configuration, monitoring, and manual intervention.

**Acceptance Criteria**:
- [ ] AC-001: Enable replanning with `musubi orchestrate --replan`
- [ ] AC-002: Specify the LLM provider with `musubi orchestrate --replan-provider <provider>`
- [ ] AC-003: Show the current replanning status with `musubi replan status`
- [ ] AC-004: Show the replanning history with `musubi replan history`
- [ ] AC-005: Approve a pending replan with `musubi replan approve <plan-id>`

---

### REQ-REPLAN-012: Configuration
**Type**: Ubiquitous
**Priority**: P1 (Should Have)
**Pattern**: The system shall [action]

**Statement**:
The system shall support replanning configuration through project.yml and environment variables.

**Acceptance Criteria**:
- [ ] AC-001: Configurable in the `replanning` section of `project.yml`
- [ ] AC-002: Enable/disable via the `MUSUBI_REPLAN_ENABLED` environment variable
- [ ] AC-003: Set the provider via the `MUSUBI_LLM_PROVIDER` environment variable
- [ ] AC-004: Per-platform API key configuration
  - `GITHUB_COPILOT_TOKEN`
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
- [ ] AC-005: Default settings can be overridden

---

## Configuration Example

### project.yml

```yaml
replanning:
  enabled: true
  provider: auto  # auto | github-copilot | anthropic | openai
  
  triggers:
    - task-failed
    - timeout
    - goal-unreachable
    
  alternatives:
    maxCount: 3
    minConfidence: 0.7
    requireApproval: false  # true for high-risk replanning
    
  retry:
    maxAttempts: 3
    delayMs: 1000
    exponentialBackoff: true
    
  timeout:
    taskMs: 60000
    replanMs: 30000
    
  llm:
    model: auto  # auto-detect based on provider
    temperature: 0.3
    maxTokens: 2000
```

### Environment Variables

```bash
# LLM Provider
export MUSUBI_LLM_PROVIDER=github-copilot

# API Keys
export GITHUB_COPILOT_TOKEN=<token>
export ANTHROPIC_API_KEY=<key>
export OPENAI_API_KEY=<key>

# Replanning
export MUSUBI_REPLAN_ENABLED=true
export MUSUBI_REPLAN_MIN_CONFIDENCE=0.7
```

---

## Traceability Matrix

| Requirement | Design | Implementation | Test |
|-------------|--------|----------------|------|
| REQ-REPLAN-001 | DES-REPLAN-001 | replanning-engine.js | replanning.test.js |
| REQ-REPLAN-002 | DES-REPLAN-002 | replanning-engine.js | replanning.test.js |
| REQ-REPLAN-003 | DES-REPLAN-003 | alternative-generator.js | alternative.test.js |
| REQ-REPLAN-004 | DES-REPLAN-004 | llm-providers/*.js | llm-provider.test.js |
| REQ-REPLAN-005 | DES-REPLAN-005 | plan-evaluator.js | evaluator.test.js |
| REQ-REPLAN-006 | DES-REPLAN-006 | patterns/swarm.js | swarm-replan.test.js |
| REQ-REPLAN-007 | DES-REPLAN-007 | patterns/sequential.js | sequential-replan.test.js |
| REQ-REPLAN-008 | DES-REPLAN-008 | workflow-orchestrator.js | workflow-replan.test.js |
| REQ-REPLAN-009 | DES-REPLAN-009 | replan-history.js | history.test.js |
| REQ-REPLAN-010 | DES-REPLAN-010 | human-gate.js | human-gate.test.js |
| REQ-REPLAN-011 | DES-REPLAN-011 | bin/musubi-orchestrate.js | cli.test.js |
| REQ-REPLAN-012 | DES-REPLAN-012 | config/replanning-config.js | config.test.js |

---

## Non-Functional Requirements

### NFR-001: Performance
- Replanning decisions shall complete within 100ms
- LLM calls shall time out within 30 seconds
- Memory usage shall be within 2x that of existing orchestration

### NFR-002: Reliability
- A failure of the replanning engine shall not halt the entire orchestration
- On LLM provider failure, fall back or disable replanning

### NFR-003: Security
- Keep API keys in environment variables or secure secret management
- Exclude sensitive information from the context sent to the LLM

### NFR-004: Compatibility
- Maintain backward compatibility with existing orchestration patterns
- When replanning is disabled, behavior is identical to existing behavior

---

## Glossary

| Term | Definition |
|------|------------|
| **Replanning** | Dynamically revising a plan during execution |
| **Alternative Path** | An alternative procedure for achieving the goal in place of a failed task |
| **LLM Provider** | A platform that provides an LLM API (GitHub Copilot, Anthropic, OpenAI, etc.) |
| **Plan History** | A record of replanning history |
| **Confidence Score** | Estimated success probability of an alternative path (0.0-1.0) |

---

*Requirements generated by MUSUBI SDD v3.5.1*

---
layout: project
ref: uml-design-studio
lang: en
title: UML Design Studio
permalink: /projects/uml-design-studio/
---

## The problem

On most embedded projects a state machine lives in two places: a diagram in a design document and
a hand-written `switch` statement in the firmware. The moment someone fixes a bug in the code, the
diagram becomes wrong, and the next person to read it is misled.

UML Design Studio removes the second copy. **The diagram is the source.** The firmware is
generated from it deterministically, so the two cannot drift apart.

## What it does

- Draws UML 2.5.1 **state machines** and **class diagrams** on an interactive canvas
- Generates **MISRA-aware C11 and C++11** that drops into a microcontroller project
- Produces a working integration example alongside the generated code
- **Simulates** the state machine before any code is flashed
- **Validates** the model and reports errors against the UML rules
- Exports diagrams to PlantUML
- Includes **built-in version control**: the model is a text file that diffs like source code

## The hard part: getting the semantics right

Drawing boxes is the easy part. The value of the tool is that the generated code follows UML
semantics exactly, including the cases that are tedious and error-prone to hand-code:

| Element | Behaviour implemented |
|---|---|
| Hierarchical states | Run-to-completion with correct entry and exit ordering |
| Junction | Static branch: guards are evaluated before leaving the source state |
| Choice | Dynamic branch: guards are evaluated after the transition's effect has run |
| History | Restores the last active substate, and is cleared when the region completes |
| Terminate | The machine exits no state, so no exit actions run |
| Completion | A composite completes only when its own region reaches a final state |
| `else` | Always tried last, whatever priority it was given |

It also supports submachines and external, internal, and local transitions.

## How it is built

The application separates the model, the generators, and the interface:

- **Core:** the model, a validator, a guard-expression parser, a simulator, and a model diff
- **Code generation:** an intermediate representation feeding separate C, C++, and PlantUML back ends
- **Interface:** a PyQt6 canvas with a code panel that shows the output next to the diagram

## Testing

The test suite compiles the generated C and C++ with `gcc` and `g++`, so a generator change that
produces code that does not build is caught immediately.

## Distribution

It runs from source on Windows, Linux, and macOS, and builds into a single standalone executable
with PyInstaller. The application sends no telemetry; models and generated code stay on disk.

## Stack

Python 3, PyQt6. Optional: git for the repository tab, gcc for the test suite.

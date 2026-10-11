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
generated from it deterministically, so the two cannot drift apart, and the model can be reviewed
in a diff like any other source file.

## How an engineer uses it

The tool replaces only the state machine or class skeleton. The rest of the firmware is written
the usual way.

**1. Model the logic.** States, transitions, guards, and actions. Guard and action bodies are
plain C or C++ expressions that call the project's own functions.

**2. Point it at a context.** The model settings name a context type and its includes. Inside
every entry, exit, do, guard, and effect body, `ctx` is the user's structure:

```c
entry   /  ctx->blink_count = 0U;
guard   [  ctx->error_count > 3U  ]
effect  /  ctx->error_count++;
```

**3. Build.** The tool writes a header, a source file, and an integration template that shows the
wiring.

**4. Drive it** from a super-loop or an RTOS task:

```c
blinky_t sm;
blinky_ctx_t ctx = {0};

blinky_ctor(&sm, &ctx);
blinky_start(&sm);                          /* initial transition and entry */
blinky_dispatch(&sm, BLINKY_EVENT_BUTTON);  /* run to completion            */
blinky_do(&sm);                             /* do-activity chain            */
blinky_is_in(&sm, BLINKY_STATE_RUNNING);    /* includes parent states       */
```

**5. Commit the model next to the code.** The same model always produces the same bytes, so a
diff shows real design changes only.

The functions that actions call are not generated. They are listed in the header, so a missing
driver call becomes a compile error instead of a silent gap.

## What the generated code guarantees

| Property | Detail |
|---|---|
| Memory | No dynamic allocation, no recursion |
| C++ | No exceptions and no RTTI |
| Tables | `static const` or `constexpr`, so they live in flash and not in RAM |
| Reentrancy | Several instances of the same machine can run side by side |
| Warnings | Clean under `-Wall -Wextra -pedantic -Werror -Wconversion -Wshadow` |
| MISRA | MISRA C:2012 and MISRA C++:2008 notes, including deliberate deviations, at the top of every file |
| Documentation | Doxygen comments on every function |
| Reproducibility | No timestamps: the same model gives the same bytes |

## State machines: the full UML vocabulary

The editor supports states, composite states, initial and final pseudostates, choice, junction,
shallow and deep history, and terminate, with external, internal, and local transitions. These
are compiled into a table-driven hierarchical state machine.

The parts that are easy to get wrong by hand are the parts the generator handles:

| Element | Behaviour implemented |
|---|---|
| Junction | Static branch: guards are evaluated before leaving the source state |
| Choice | Dynamic branch: guards are evaluated after the transition's effect has run |
| History | Restores the last active substate, and is cleared when the region completed through a final state |
| Terminate | The machine exits no state, so no exit actions run and nothing executes afterwards |
| Completion | A composite completes only when its own region reaches a final state |
| `else` | Always tried last, whatever priority it was given |

Each of these is pinned down by a test that quotes the clause of the UML 2.5.1 specification it
comes from.

## Class diagrams

Classes, abstract classes, and interfaces, with association, aggregation, composition,
generalization, realization, and dependency. The output is either C using a struct and a function
table, or C++ with virtual dispatch.

![Class diagram mode]({{ '/assets/img/projects/uml-class-light.png' | relative_url }})

## Simulation and validation

- **Simulation before code.** The simulator runs the diagram using the same intermediate
  representation and the same algorithm as the code generators. Their equivalence is re-checked on
  every test run, so what is seen on the canvas is what the firmware will do. The simulation strip
  offers one button per event, live guard switches, and a step-by-step run-to-completion trace.
- **Continuous validation.** Problems are reported as the model is edited. Every finding cites the
  UML 2.5.1 clause and page it comes from, and clicking it selects the offending element.
- **Symbol-aware checks.** The validator knows which identifiers the generator will emit, so two
  names that would collapse into the same constant are reported as an error instead of becoming a
  broken build.

## Version control, built in

The third tab is a git client scoped to the workspace: a commit graph with branches and merges, a
staging area, and a unified diff. The model and the firmware it produced are committed together.

![Repository tab]({{ '/assets/img/projects/uml-git-light.png' | relative_url }})

## How it is built

| Layer | Contents |
|---|---|
| Core | Model, validator, guard-expression parser, simulator, model diff, submachine handling, git back end |
| Code generation | One intermediate representation feeding separate C, C++, and PlantUML generators, for both state machines and classes |
| Interface | PyQt6 canvas, properties and workspace panels, a code panel with one tab per generated file, and a problems list |

Code is written to disk only on Build, so moving elements around on the canvas never touches the
filesystem.

## Testing

The test suite does not stop at checking that code is produced. It generates the code, compiles it
with `-Werror`, runs it, and compares the behaviour trace against a Python reference and against a
fuzz run. It also checks UML 2.5.1 conformance clause by clause, exercises the feature surface
through the real interface, and tests the git layer against real temporary repositories.

## Distribution and privacy

The application runs from source on Windows, Linux, and macOS, and builds into a standalone
executable with PyInstaller. It sends no telemetry, analytics, or crash reports; models and
generated code never leave the disk.

## Stack

Python 3, PyQt6. Optional: git for the repository tab, gcc and g++ for the test suite.

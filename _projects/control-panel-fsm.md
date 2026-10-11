---
layout: project
ref: control-panel-fsm
lang: en
title: Menu-Driven Control Panel
permalink: /projects/control-panel-fsm/
---

## The goal

Build a small control panel on a character LCD where the user moves through menus to operate
several devices, and structure it so that adding a screen does not mean rewriting the ones that
already work.

## The design: an event-driven state machine

Menu firmware written as nested `if` statements becomes unmanageable quickly. This project
implements the panel as a flat finite state machine instead.

**States.** Each screen is a state: the main menu, the servo screen with its calibration, manual,
and automatic sub-screens, the stepper motor screen, the pressure sensor screen, and the LED
screen with dimmer, brightness, and on/off modes.

**Events.** User input is turned into a small set of signals: move up, move down, select, run a
task, abort a task, leave a menu. In addition to these, each state receives three internal
signals:

| Signal | Purpose |
|---|---|
| `ENTRY` | Runs once when the state is entered, for example to draw the screen |
| `DO` | Runs repeatedly while the state is active |
| `EXIT` | Runs once when the state is left, for example to stop a motor |

Because drawing happens in `ENTRY` and cleanup in `EXIT`, a transition can never leave half of an
old screen on the display or a motor running after the user has moved on.

## What it controls

| Device | Functions |
|---|---|
| Servo motor | Minimum and maximum calibration, manual mode, automatic mode |
| Stepper motor | Operation from its own screen |
| LEDs | Dimming, brightness setting, on/off |
| BMP180 | Pressure sensor readout |
| Display | Character LCD over I2C |

The servo calibration values are kept in the application structure, so the manual and automatic
modes use the limits the user actually set.

## Related project

[UML Design Studio]({{ '/projects/uml-design-studio/' | relative_url }}) generates this kind of
state machine code from a drawing.

## Stack

C, STM32F407, STM32 HAL, I2C, STM32CubeIDE.

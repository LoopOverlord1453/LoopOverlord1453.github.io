---
layout: project
ref: control-panel-fsm
lang: en
title: Menu-Driven Control Panel
permalink: /projects/control-panel-fsm/
---

## The goal

Build a small control panel on a character LCD where the user moves through menus with four
buttons to operate several devices, and structure it so that adding a screen does not mean
rewriting the ones that already work.

## Hardware

| Item | Role |
|---|---|
| STM32F407 | Controller |
| Character LCD over I2C | Menu display |
| Four push buttons | Navigation and selection |
| Potentiometer on the ADC | Analog input for calibration and adjustment |
| Timer PWM outputs | Servo and LED drive |
| Buzzer | Audible feedback on key presses |

## The design: an event-driven state machine

Menu firmware written as nested `if` statements becomes unmanageable quickly: every new screen
adds branches to every existing one. This project implements the panel as a flat finite state
machine instead.

### States

Each screen is a state.

| State | Screen |
|---|---|
| `MENU_SCREEN` | Main menu |
| `SERVO_SCREEN` | Servo menu |
| `SERVO_MIN_CALIB`, `SERVO_MAX_CALIB` | Servo end-point calibration |
| `SERVO_MANUEL`, `SERVO_AUTO` | Servo operating modes |
| `STEP_SCREEN` | Stepper motor |
| `BMP180_SCREEN` | Pressure sensor |
| `LED_SCREEN` | LED menu |
| `LED_DIMMER`, `LED_BRIGHTNESS`, `LED_ON_OFF` | LED modes |

### Events

User input is turned into a small set of signals: `INC_MENU`, `DEC_MENU`, `SELECT_ID`, `DO_TASK`,
`ABORT_TASK`, and `ABORT_MENU`. In addition, each state receives three internal signals:

| Signal | Purpose |
|---|---|
| `ENTRY` | Runs once when the state is entered, for example to draw the screen |
| `DO` | Runs repeatedly while the state is active |
| `EXIT` | Runs once when the state is left, for example to clear the display |

### Dispatch

One function, the state machine dispatcher, receives every event and calls the handler of the
active state. A handler reports one of four results: the event was handled, ignored, caused a
transition, or should continue running its `DO` action. On a transition the dispatcher sends `EXIT`
to the old state and `ENTRY` to the new one.

Because drawing happens in `ENTRY` and cleanup in `EXIT`, a transition can never leave part of an
old screen on the display. And because each screen is one handler function, adding a screen means
adding one function and one state, without touching the others.

## Input handling

**Software debouncing.** The four buttons are sampled in the main loop and passed through a
three-state debouncer (not pressed, bouncing, pressed). A press produces exactly one event,
regardless of how the contacts chatter.

**Filtered analog input.** The potentiometer is read through the ADC and smoothed with a moving
average filter, so the displayed value and the servo position do not jitter. The filtered reading
is then mapped from the ADC range to the calibrated output range.

## Servo calibration

The servo's minimum and maximum positions are set from the panel and stored in the application
object. Later positioning uses the limits the user actually calibrated, rather than constants
compiled into the firmware. The current duty value is shown on the display while adjusting.

## Status

The state machine framework, the main menu, the servo menu with both calibration screens, and the
LED menu are implemented, together with debouncing, the analog input path, and the buzzer. The
handlers for the servo operating modes, the stepper motor, the pressure sensor, and the individual
LED modes are declared as states but not yet filled in.

## Related project

[UML Design Studio]({{ '/projects/uml-design-studio/' | relative_url }}) generates this kind of
state machine code from a drawing.

## Stack

C, STM32F407, STM32 HAL, I2C, ADC, timers and PWM, STM32CubeIDE.

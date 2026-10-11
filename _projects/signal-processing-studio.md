---
layout: project
ref: signal-processing-studio
lang: en
title: Signal Processing Studio
permalink: /projects/signal-processing-studio/
---

## The problem

On an embedded project the algorithm is usually designed in one tool, the live data is watched in
another, and the C code is written by hand at the end. Every hand-off is a place where the
design and the firmware can quietly diverge.

Signal Processing Studio puts the three steps in one window: watch the real signal coming off the
board, design the filter, estimator, or controller against that data, and export C code that
matches what was designed.

## What it does

| Area | Capability |
|---|---|
| Live view | Multi-stream UDP receiver, time and spectrum plots, exact sample-loss counting, recording and replay |
| Filter designer | IIR, FIR, and custom filters with magnitude, phase, group delay, and pole-zero views; applied to the live stream |
| Sensor fusion | Mahony, Madgwick, Kalman, EKF, UKF, and particle filter side by side, scored against a reference |
| Signal generator | Waveform design for a DAC with quantization analysis: THD, SNR, ENOB |
| Control design | Model workspace, system identification, analysis, PID, compensators, state feedback, MPC |
| Block diagram | Drag-and-drop simulator with linearization and quadrotor and fixed-wing autopilot templates |
| Code generation | C code for filters, fusion algorithms, controllers, and MPC, with a per-MCU cost estimate |

![Filter designer]({{ '/assets/img/projects/sps-filter.png' | relative_url }})

## How it is built

**A self-describing wire protocol.** I designed a binary frame format, SPTF, so that the tool
needs no configuration for a new device. Each stream announces its own sample rate, channel
count, data type, units, and scaling. A fixed 32-byte header keeps overhead low, 17 sample types
cover everything from 8-bit integers to 24-bit packed audio and complex I/Q, and a 64-bit sample
counter lets the receiver report exactly how many samples were lost instead of guessing.

**A receiver that cannot stall the interface.** The UDP receiver runs in its own process and
writes samples into shared-memory ring buffers. The interface reads those buffers about thirty
times a second. A slow redraw therefore never drops a packet, and Python's global interpreter
lock is not in the data path.

**Filters that carry state.** Live filters keep their internal state between blocks, so there is
no discontinuity at block boundaries when a filter is applied to a running stream.

![Sensor fusion]({{ '/assets/img/projects/sps-fusion.png' | relative_url }})

## Sensor fusion

Six orientation algorithms run on the same recording at once. When the recording contains a
reference orientation, the tool reports each algorithm's RMS error, which turns "which filter
should I use?" into a measurement. Beyond orientation there are scenario-based estimators for
altitude (barometer and accelerometer), 2D position (GNSS, gyroscope, and odometry), and a general
linear multi-sensor Kalman filter. The selected algorithm is exported as C.

## Control design

The control workspace follows the usual engineering sequence: build or identify a model, analyze
it, design a controller, simulate.

- **System identification:** ARX, ARMAX, output-error, Box-Jenkins, subspace, and nonlinear models
- **Classical design:** root locus, Bode, Nyquist, stability margins, automatic PID tuning
- **Modern design:** LQR, LQI, pole placement, Kalman filter, LQG
- **Model predictive control:** constrained linear MPC with its own QP solver
- **Block diagram:** fixed-step and variable-step solvers, linearization between chosen points

![Controller design]({{ '/assets/img/projects/sps-control.png' | relative_url }})

![Block diagram editor]({{ '/assets/img/projects/sps-diagram.png' | relative_url }})

## Code generation

Generated C targets microcontrollers directly. Alongside the code the tool estimates the cost of
one update on a chosen core, from Cortex-M0+ to Cortex-M7, based on a count of the floating-point
operations the algorithm performs. The estimates are labelled as estimates in the interface.

## Testing

The numerical core is covered by a pytest suite of more than forty modules: LTI analysis,
discretization, frequency and time response, system identification, MPC and its QP solver, the
block diagram engine, the UAV models, and the generated C code.

## Stack

Python 3.14, PyQt6, pyqtgraph, NumPy, SciPy. Licensed under LGPL 2.1.

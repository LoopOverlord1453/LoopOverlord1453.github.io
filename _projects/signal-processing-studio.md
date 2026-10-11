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
design and the firmware can quietly diverge: a coefficient is rounded differently, a sample rate
is assumed, a sign convention is flipped.

Signal Processing Studio puts the whole path in one window. You watch the real signal coming off
the board, design the filter, estimator, or controller against that data, and export C code that
is checked against the design it came from.

## At a glance

| Area | Capability |
|---|---|
| Live view | Multi-stream UDP receiver, time and spectrum plots, exact sample-loss counting |
| Recording | Lossless capture to `.sptr`, replay from 0.25× to 10× with seek and loop |
| Review | Freeze the live stream and analyze a snapshot while acquisition continues |
| Filter designer | IIR, FIR, and special-purpose filters; magnitude, phase, group delay, pole-zero |
| Sensor fusion | Orientation, altitude, 2D position, and general multi-sensor Kalman scenarios |
| Signal generator | Waveform design for a DAC with quantization analysis |
| Control design | Models, system identification, analysis, controller design, MPC, block diagrams |
| Code generation | C for filters, fusion, controllers, MPC, and DAC tables, with measured memory use |

![Filter designer]({{ '/assets/img/projects/sps-filter.png' | relative_url }})

## The wire protocol: SPTF

A tool like this is only useful if a new device can be connected without configuring anything.
I designed a binary frame format, SPTF, in which the stream describes itself.

| Property | Design |
|---|---|
| Frame types | `DESCRIPTOR` (stream layout), `DATA` (samples), `MARKER` (debug event with code and text) |
| Header | Fixed 32 bytes, little-endian, no alignment padding |
| Self-description | Sample rate, channel count, data type, channel names, units, scale and offset |
| Data types | 17: 8 to 64-bit integers, 24-bit packed, float16/32/64, complex I/Q |
| Layout | Interleaved or planar channels |
| Loss detection | A 64-bit `first_sample` counter gives the exact number of missing samples |
| Integrity | Optional CRC-32 |
| Efficiency | 96.5% payload in a standard 1472-byte datagram |
| Late join | The descriptor repeats at least once a second, so a receiver can attach mid-stream |
| Transport | The same frame is used unchanged over UDP and in recording files |

A device may send several streams at once, each with its own rate and type, which is how a 25.6 kHz
vibration channel and a 10 Hz temperature channel can share one connection.

## Architecture: a receiver that cannot stall the interface

At gigabit rates a standard-MTU link delivers about 80,000 datagrams per second. If reception and
the user interface share one Python process, they also share the interpreter lock, and reception
stutters whenever the interface is busy. So they do not share a process.

```
UDP / .sptr file ──► receiver process ──► shared memory (one ring buffer per stream)
                     validate, count loss,        ▲
                     record                       │ zero-copy read, ~30 frames/s
                           │ event queue          │
                           └──────────────► interface process (panels, plots)
```

- On the hot path the receiver copies bytes straight into shared memory without creating NumPy
  objects, at about 4 µs per packet.
- Replay goes through the same storage layer as live reception, so analysis of a recording behaves
  exactly like analysis of a live stream.
- Plots decimate with a peak-preserving min/max reduction down to the pixel count, so a spike is
  never lost by drawing fewer points.

**Measured on an 8-core Windows 11 machine:**

| Scenario | Received | Lost |
|---|---|---|
| 115 MB/s, 1472-byte datagrams, about 77,000 datagrams/s | 113.3 MB/s | 0 of 115 million samples |
| 115 MB/s, 8972-byte jumbo frames | 113.5 MB/s | 0 |
| 115 MB/s, 65,507-byte datagrams | 113.5 MB/s | 0 |

In the gigabit test the bottleneck was the Python sender, not the receiver: three senders had to
run in parallel to fill the link.

## Filter design

- **IIR and FIR design** with the usual methods and band types, plus special-purpose filters.
- **Analysis views:** magnitude, phase, group delay, and pole-zero map, updated as parameters change.
- **Live application:** filters keep their state between blocks, so there is no discontinuity at
  block boundaries. Raw and filtered traces are shown together.
- **Processing chain:** several stages in sequence, reorderable, with undo and redo.
- **Fixed-point export:** coefficients as float64, float32, Q31, or Q15, in CSV or as a C header in
  the layout CMSIS-DSP expects, including the sign and ordering conventions that are easy to get
  wrong by hand.
- **Quantization made visible:** the designer plots the response of the quantized coefficients on
  top of the ideal one. An 8th-order elliptic filter that is accurate to 1e-4 dB in Q31 deviates
  visibly in Q15, and the tool shows this before the filter reaches hardware.

## Sensor fusion

![Sensor fusion]({{ '/assets/img/projects/sps-fusion.png' | relative_url }})

Four scenarios are built in, each with several algorithms that run side by side on the same data:

| Scenario | Inputs | Algorithms |
|---|---|---|
| Orientation | Gyroscope, accelerometer, optional magnetometer | Mahony, Madgwick, per-axis Kalman, multiplicative EKF, UKF, particle filter |
| Altitude | Barometer, vertical acceleration | Complementary, linear KF, EKF with a pressure measurement model, UKF, particle filter |
| 2D position | GNSS, yaw rate, odometry speed | Dead reckoning, EKF, UKF, particle filter |
| Linear multi-sensor | One to six position, velocity, or acceleration sensors | Weighted average, Kalman filter, particle filter |

Channels are mapped automatically from their names and units. Sparse sensors, such as a 5 Hz GNSS
in a 100 Hz stream, are handled as missing measurements. When the recording contains a reference,
the tool reports RMS and maximum error per output for each algorithm, which turns "which filter
should I use?" into a measurement. For orientation there is also a 3D view of the estimated
attitude.

## Signal generator

Designs the waveform a DAC will output: standard shapes, chirps, and user-defined formulas. The
tool models the DAC's resolution and zero-order hold, chooses a table length that minimizes
frequency error, computes the STM32 timer prescaler and reload values, and reports THD, SFDR, SNR,
SINAD, and ENOB of the quantized output. The result is exported as a C table.

## Control design

![Controller design]({{ '/assets/img/projects/sps-control.png' | relative_url }})

The workspace follows the engineering sequence: obtain a model, analyze it, design a controller,
simulate.

- **Models:** transfer function, zero-pole-gain, and state-space forms; conversion and discretization.
- **System identification:** ARX, ARMAX, output-error, Box-Jenkins, subspace, and nonlinear ARX,
  estimated from recorded or live data.
- **Analysis:** step response, Bode, Nyquist, pole-zero map, stability margins, step metrics.
- **Classical design:** PID tuning to a target crossover frequency and phase margin, lead-lag and
  notch compensators, root locus.
- **Modern design:** LQR, LQI, pole placement, Kalman filter, LQG.
- **Model predictive control:** constrained linear MPC with its own QP solver.
- **Block diagram:** a drag-and-drop editor with fixed-step and variable-step solvers and
  linearization between chosen points.
- **UAV templates:** a cascaded quadrotor autopilot, quadrotor LQR and MPC, and a fixed-wing
  autopilot using successive loop closure.

![Block diagram editor]({{ '/assets/img/projects/sps-diagram.png' | relative_url }})

### How the numbers are trusted

Control software that gives slightly wrong answers is worse than none. Every deterministic
calculation is therefore compared against MATLAB. A helper runs a MATLAB script in batch mode and
stores the results as JSON; the tests read those files, so the suite runs without MATLAB installed.

- Closed-form results (discretization, margins, LQR, pole placement, step and Bode responses) must
  match to a relative tolerance of 1e-8.
- Iterative estimators (ARMAX, output-error, Box-Jenkins, the MPC QP) must reach the same optimum
  to 1e-5 to 1e-4.
- Where MATLAB's method is unpublished, such as automatic PID tuning, the test checks that the
  stated target is met rather than claiming identical output, and the documentation says so.

## Code generation

Generated C targets microcontrollers directly, with no dynamic allocation. The dialog asks for the
core (Cortex-M0+, M3, M4F, M7, M33F, ESP32, or RISC-V), compiler, optimization level, and float or
double, then produces headers, sources, an example main loop, and a usage guide.

What sets it apart is that the resource figures are measured, not guessed:

- **Flash and RAM:** the generated code is compiled with `arm-none-eabi-gcc` and `clang` on the
  host and the object size is read back. RAM is the size of the state structure.
- **Stack:** the worst-case call path is derived from the disassembly of the linked image.
- **CPU cost:** operation counts per step are measured by compiling the same C with a counting
  numeric type, then converted to microseconds for the chosen core and clock.
- **Equivalence:** tests confirm the C output matches the Python reference, to about 1e-14 rad in
  double precision for orientation.
- **Warnings:** the code compiles without warnings under `-Wall -Wextra -pedantic -Werror` across
  the supported cores and both compilers.

Figures for cores without an installed compiler are labelled as estimates in the interface.

## Testing

The project has a pytest suite of more than forty test modules covering the protocol (including a
byte-exact test vector and malformed frames), filters, live filtering, sensor fusion, the signal
generator, the control library, MPC, the block diagram engine, the UAV models, the generated C
code, and end-to-end runs over real UDP sockets. A set of thirteen sample recordings, from mains
measurements to I/Q data and referenced IMU logs, makes it possible to try everything without
hardware.

## Stack

Python 3.14, PyQt6, pyqtgraph, NumPy, SciPy. Licensed under LGPL 2.1.

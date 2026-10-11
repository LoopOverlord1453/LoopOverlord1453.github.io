---
layout: page
title: Projects
permalink: /projects/
---

## Signal Processing Studio

A desktop workbench for real-time signal analysis and control design on embedded systems.

It receives live data from a target board over Ethernet (UDP) using a compact self-describing
binary protocol, and lets you analyze and process it in one window:

- Live time-domain and spectrum views with exact sample-loss detection
- Lossless recording and replay
- IIR and FIR filter design, applied to the live stream
- Sensor fusion for orientation, altitude, and 2D position, with side-by-side algorithm comparison
- Control design: system identification, PID, state feedback, MPC, and a block diagram simulator
- C code generation for microcontrollers

Built with Python, PyQt6, pyqtgraph, NumPy, and SciPy.

[Source code on GitHub](https://github.com/LoopOverlord1453/signal-processing-studio)

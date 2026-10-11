---
layout: project
ref: arm-motion-control
lang: en
title: ARM Motion Control
permalink: /projects/arm-motion-control/
---

## The task

During my 2024 summer internship I developed the firmware and the PC software for a mechanical
arm driven by a DC motor. An operator sets how many turns the arm makes in each direction and how
long one full turn takes. The system works with a motion sensor and has a manual and an
automatic mode.

## System overview

| Part | Implementation |
|---|---|
| Controller | STM32F030C8T6 on a dedicated motor motion board |
| PC interface | Windows desktop application written in C# |
| Link | UART framing over an RS-485 physical layer |
| Integrity | CRC16 on every packet |
| Persistence | Commands stored in the MCU's internal flash |
| Peripherals | DC motor, motion sensor, LED, buzzer, speaker |
| Power | 12 V DC supply |

## What I built

**A packet protocol.** The PC and the board exchange fixed-format packets protected by a CRC16.
I documented the packet layout so that the interface and the firmware were developed against the
same specification.

![Packet format]({{ '/assets/img/projects/arm-packet-format.png' | relative_url }})

**Firmware in separate drivers.** The RS-485 transport, the CRC calculation, and flash storage
are independent modules under an application layer, rather than code mixed into `main.c`.

**Two operating modes.** The system supports a manual mode, driven from the interface, and an
automatic mode.

**Recovery after power loss.** Normally a system like this has to be configured again from the PC
after every power cut. Here every command received is written to internal flash; when power
returns, the firmware reads the stored commands and resumes from the last known state with no
operator present.

**The desktop interface.** The C# application sets direction, speed, and mode, and also controls
the LED, buzzer, motion sensor, and speaker for testing the board.

## Stack

C, STM32F030, STM32 HAL, RS-485, CRC16, internal flash, C#, Visual Studio.

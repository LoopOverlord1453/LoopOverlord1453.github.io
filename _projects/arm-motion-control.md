---
layout: project
ref: arm-motion-control
lang: en
title: ARM Motion Control
permalink: /projects/arm-motion-control/
---

## The task

During my 2024 summer internship I developed the firmware and the PC software for a motor motion
board that drives a mechanical arm with a DC motor. An operator sets how many turns the arm makes
in each direction; the board also has a motion sensor input and LED, buzzer, and speaker outputs.

## System overview

| Part | Implementation |
|---|---|
| Controller | STM32F030C8T6 (Cortex-M0) on a dedicated motor motion board |
| PC interface | Windows desktop application in C# (WinForms) |
| Link | UART over a half-duplex RS-485 physical layer |
| Integrity | CRC16 on every packet |
| Persistence | Parameters stored in the last page of internal flash |
| Inputs | RS-485 commands, motion sensor on an external interrupt |
| Outputs | DC motor, two LEDs, buzzer, speaker |
| Power | 12 V DC supply |

## The packet protocol

The PC and the board exchange fixed 10-byte packets. Delimiters make a captured stream readable on
a logic analyzer, and the CRC covers everything before it.

![Packet format]({{ '/assets/img/projects/arm-packet-format.png' | relative_url }})

| Byte | Field | Value |
|---|---|---|
| 0 | Header | `$` |
| 1 | Delimiter | `,` |
| 2 | Command | Subsystem identifier |
| 3 | Delimiter | `,` |
| 4–5 | Data | Two data bytes |
| 6 | Delimiter | `,` |
| 7 | Trailer | `!` |
| 8–9 | CRC16 | High byte, then low byte |

Each subsystem has its own command identifier: the speaker, each LED, the buzzer, motor stop,
motor manual mode, and motor automatic mode. For the motor commands, the forward and backward turn
counts are packed into the high and low nibbles of one data byte.

A second group of commands runs **self-tests**: an LED test, a buzzer test, a speaker test, a motor
test, and commands that start and stop a full system test. These let the board be checked from
the PC after assembly without writing a special firmware build.

## Firmware structure

The firmware is split into independent drivers under one application layer:

| Module | Responsibility |
|---|---|
| `rs485` | Direction control, byte reception, packet parser, CRC check |
| `crc16` | Checksum calculation |
| `flash` | Page erase, write, and read of the stored parameters |
| `main_app` | Command dispatch, motor sequencing, subsystem control, self-tests |

**Receiving without blocking.** Bytes arrive one at a time through the UART receive interrupt.
Nothing waits for a whole packet.

**A parser built as a state machine.** Each received byte advances a small state machine through
header, command, data, trailer, and CRC states, checking the format as it goes. Only after the
final CRC byte arrives is the checksum computed over the first eight bytes and compared, and only
a packet that passes both the format check and the CRC check is handed to the command dispatcher.

**Half-duplex direction control.** RS-485 shares one pair of wires for both directions. The
transmit routine raises the transceiver's direction pin, sends, and lowers it again, so the board
only drives the bus while it is actually transmitting.

## Recovery after power loss

Normally a system like this has to be configured again from the PC after every power cut. Here
the current mode and parameters are written to a dedicated flash page whenever they change: when
the motor enters automatic or manual mode, when it stops, and when a new command arrives during
operation. At start-up the firmware reads that page back into the motor object and resumes from
the last known state with no operator present.

Reserving the final flash page for this keeps the stored data well away from the program image.

## The desktop interface

The C# application lists the available serial ports, opens the selected one at a chosen baud
rate, and builds each packet from the operator's input: it assembles the eight payload bytes,
computes the CRC16, appends it, and writes the ten bytes to the port. Incoming data is shown in a
log window. Buttons cover every subsystem and both motor modes, so the board can be exercised
without typing raw bytes.

A reference file in the repository lists ready-made packets with their precomputed CRC values,
which makes it possible to test the firmware parser from any serial terminal.

## Stack

C, STM32F030, STM32 HAL, UART, RS-485, CRC16, internal flash, external interrupts, C#, WinForms,
Visual Studio.

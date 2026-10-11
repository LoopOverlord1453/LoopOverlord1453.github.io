---
layout: project
ref: stm32f407-bare-metal
lang: en
title: STM32F407 Bare-Metal Driver Library
permalink: /projects/stm32f407-bare-metal/
---

## Why write drivers that already exist

A vendor HAL gets a peripheral working quickly, but it also hides what the hardware is doing.
I wrote this library to learn the STM32F407 at the level where problems are actually debugged:
the reference manual, the clock tree, and the individual register bits.

## What it contains

| Driver | Covers |
|---|---|
| RCC | Clock configuration and peripheral clock control |
| GPIO | Pin configuration, reading, and writing |

The project uses only the CMSIS core and device headers, which provide register definitions and
nothing else. There is no STM32 HAL or LL layer underneath. Example applications in the repository
exercise the drivers, including an interrupt example and a clock configuration example.

## Approach

- Each driver has a header describing its configuration structures and a source file that writes
  the registers.
- Register access goes through the CMSIS device definitions, so every line can be checked against
  the reference manual.
- The startup file and the linker scripts are part of the project, so the path from reset vector
  to `main` is visible.

## Status

RCC and GPIO are implemented. The library is a learning project and is extended as I need more
peripherals.

## Stack

C, STM32F407, CMSIS, STM32CubeIDE.

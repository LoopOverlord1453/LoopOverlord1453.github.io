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

The project uses only the CMSIS core and device headers, which provide register definitions and
nothing else. There is no STM32 HAL or LL layer underneath.

| Driver | Covers |
|---|---|
| RCC | Oscillator selection, PLL configuration, system clock switching, bus prescalers, clock output |
| GPIO | Pin configuration through an init structure |

## The clock driver

The RCC driver is the larger of the two, because nothing else on the chip works until its clock
is right.

| Part | What it does |
|---|---|
| Oscillator control | Turns the internal (HSI) and external (HSE) oscillators on or off, with or without bypass |
| PLL | Sets the source and the M, N, P, and Q factors |
| System clock | Selects HSI, HSE, or PLL as the system clock source |
| Bus prescalers | Sets the AHB, APB1, and APB2 dividers |
| Clock output | Routes an internal clock to the MCO pin for measurement |
| Status | Every configuration step returns a status flag so a failure can be handled |

The example application brings the chip from reset to its full speed:

```c
osc->sys_clk_src = SYS_CLK_SRC_PLL;
osc->hse_state   = HSE_ON;
osc->hsi_state   = HSI_OFF;
osc->pll.pll_src = PLL_SRC_HSE;
osc->pll.pll_M   = 4;
osc->pll.pll_N   = 168;
osc->pll.pll_P   = PLL_P_2;

osc->prescaler.ahb_pres  = AHB_PRESCALER_1;
osc->prescaler.apb1_pres = APB1_PRESCALER_4;
osc->prescaler.apb2_pres = APB2_PRESCALER_2;
```

With an 8 MHz crystal this gives a 2 MHz PLL input, a 336 MHz VCO, and a 168 MHz system clock,
with APB1 at 42 MHz and APB2 at 84 MHz, which are the limits of those buses.

Routing the clock to the MCO pin matters more than it looks: it is the way to confirm with an
oscilloscope that the chip is really running at the frequency the code believes it is.

## Approach

- **Init structures.** Each driver is configured by filling in a structure and passing it to an
  init function, the same pattern the vendor libraries use, so the code reads familiarly.
- **Checked against the manual.** Register access goes through the CMSIS device definitions, so
  every line can be compared with the reference manual.
- **Nothing hidden.** The startup file and the linker scripts are part of the project, so the path
  from the reset vector to `main` is visible.
- **Examples included.** The repository contains a clock configuration example and an interrupt
  example alongside the drivers.

## Status

RCC and GPIO are implemented. The library is a learning project and is extended as more
peripherals are needed.

## Stack

C, STM32F407VG, CMSIS, STM32CubeIDE.

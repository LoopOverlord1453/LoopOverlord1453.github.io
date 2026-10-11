---
layout: post
title: "Learning Embedded Linux on a BeagleBone Green: The Roadmap"
date: 2026-10-11
categories: embedded-linux
---

I am starting a series on embedded Linux, using a BeagleBone Green as the target board. This
first post lays out the plan. Each step below will become its own post once I have worked
through it.

## Why the BeagleBone Green

The board is built around the TI AM335x, an older Cortex-A8 processor. That age is an advantage
for learning: the hardware is fully documented, mainline kernel support is mature, and almost
every problem I am likely to hit has been written about before.

## The plan

1. **First boot** — flash a stock image, connect over the serial console and SSH, and set up a
   cross-compilation toolchain on the host.
2. **Peripherals from user space** — drive GPIO, I2C, SPI, and UART, and read a few Grove sensors.
3. **Device tree** — read the board's device tree, then write an overlay to enable a peripheral.
4. **Kernel** — build the kernel from source, boot it, and write a simple character driver.
5. **Bootloader** — build U-Boot and trace the boot sequence from power-on to login prompt.
6. **Build systems** — generate a minimal custom image with Buildroot, then repeat with Yocto.

## How the posts will be structured

Every post will follow the same outline:

- **Goal** — what I set out to do
- **Steps** — the exact commands I ran
- **What went wrong** — the errors I hit, with the actual output
- **Fix** — what solved it and why

The mistakes are the useful part, so I will not edit them out.

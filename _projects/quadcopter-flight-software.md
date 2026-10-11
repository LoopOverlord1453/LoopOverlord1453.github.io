---
layout: project
ref: quadcopter-flight-software
lang: en
title: Real-Time Quadcopter Flight Software
permalink: /projects/quadcopter-flight-software/
---

## The goal

Write the flight software for a quadcopter from the sensor drivers up, with a structure where
each part can be developed and tested on its own instead of living inside one large `main.c`.

## Architecture

The firmware runs on an STM32F407 under FreeRTOS. Periodic tasks are scheduled with
`vTaskDelayUntil`, which keeps each task's period fixed regardless of how long its body takes.
Every function of the aircraft is a separate library with its own headers and sources:

| Module | Contents |
|---|---|
| Sensor library | BMI160 IMU, BMP388 barometer, HMC5883L magnetometer |
| Sensor fusion library | Complementary filter, 1D Kalman filter, Madgwick AHRS, Mahony AHRS |
| Digital filter library | FIR filter and first-order RC low-pass filter |
| Controller driver | PID controller with a standalone test file |
| Flight interface parser | Parser for incoming flight commands |
| Flight control | Structures that tie the sensors, the ESC outputs, and the command interface together |
| Quadcopter model | A dynamic model of the vehicle, exported from Simulink as C code |
| Sound effect | Buzzer tones for status feedback |

Motor outputs use timer PWM channels, and a USB CDC device provides a link to the PC.

## Design decisions

**A port layer under the vendor drivers.** The BMI160 and BMP388 use Bosch's official drivers.
Instead of editing them, I wrote a thin port layer that supplies the bus read, bus write, and
delay functions. Updating a vendor driver or moving to another MCU touches only the port file.

**Several estimators behind one purpose.** Four attitude estimation approaches are implemented
side by side. This makes it possible to compare a simple complementary filter with Madgwick and
Mahony on the same hardware and choose with data.

**Filtering as its own library.** The FIR and RC filters are independent of the sensors, so the
same code can be applied to gyroscope data, barometer data, or any other signal.

## Status

The drivers, estimators, filters, controller, and RTOS skeleton are in place. Integrating them
into a complete closed-loop flight controller is still in progress, and the software has not been
flight tested.

## Stack

C, STM32F407, FreeRTOS, STM32 HAL, STM32CubeIDE.

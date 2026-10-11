---
layout: project
ref: rt-sense
lang: en
title: "RT-Sense: Quadcopter Sensor Library"
permalink: /projects/rt-sense/
---

## The goal

A flight controller is only as good as the timing of its measurements. RT-Sense is a set of sensor
drivers written for that requirement: each sensor raises a data-ready interrupt, so the software
reads a sample when it exists instead of polling and hoping.

## Sensors and configuration

| Sensor | Role | Configuration |
|---|---|---|
| BMP388 | Barometric pressure and temperature | 50 Hz output, pressure oversampling ×8, IIR filter coefficient 3, about 11 cm RMS altitude noise |
| BMI160 | 6-axis accelerometer and gyroscope | Accelerometer ±16 g at 1600 Hz, gyroscope ±2000 °/s at 3200 Hz |
| HMC5883L | 3-axis magnetometer | Oversampling ×8, 160 Hz output |

All three use their data-ready pin as an interrupt source.

## How it is built

**Portable C with no dependencies.** The drivers do not depend on a particular HAL. They can be
used with the STM32 HAL or with bare-metal I2C and SPI routines on other ARM Cortex-M parts.

**Official drivers, ported cleanly.** The BMP388 and BMI160 drivers are Bosch's official
libraries. I ported them to STM32 through a separate port layer rather than modifying the vendor
code, which keeps future driver updates straightforward.

**Chosen settings, not defaults.** The oversampling, filter, and output-rate values in the table
were selected for a quadcopter: fast inertial data for the attitude loop and a slower,
well-filtered barometer for altitude.

## Planned additions

INA219 current monitor, BNO055 orientation sensor, BMP180 barometer, and HC-SR04 ultrasonic range
sensor.

## Relation to other projects

This library provides the sensor layer of the
[quadcopter flight software]({{ '/projects/quadcopter-flight-software/' | relative_url }}).

## Stack

C, STM32F4, I2C, SPI, STM32CubeIDE.

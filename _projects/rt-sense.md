---
layout: project
ref: rt-sense
lang: en
title: "RT-Sense: Quadcopter Sensor Library"
permalink: /projects/rt-sense/
---

## The goal

A flight controller is only as good as the timing of its measurements. An estimator integrates
gyroscope samples assuming they are evenly spaced; if a sample is read late, or read twice, the
attitude estimate is wrong even though every individual number is correct.

RT-Sense is a set of sensor drivers written for that requirement. Each sensor raises a data-ready
interrupt, so the software reads a sample when it exists instead of polling and hoping.

## Sensors and configuration

| Sensor | Role | Configuration |
|---|---|---|
| BMP388 | Barometric pressure and temperature | 50 Hz output, pressure oversampling ×8, temperature oversampling ×1, IIR filter coefficient 3, about 11 cm RMS altitude noise |
| BMI160 | 6-axis accelerometer and gyroscope | Accelerometer ±16 g at 1600 Hz, gyroscope ±2000 °/s at 3200 Hz |
| HMC5883L | 3-axis magnetometer | Oversampling ×8, 160 Hz output |

All three use their data-ready pin as an interrupt source.

### Why these settings

The values are chosen for a quadcopter rather than left at defaults:

- **Inertial data is fast.** The attitude loop needs angular rate with as little delay as possible,
  so the gyroscope runs at 3200 Hz and the accelerometer at 1600 Hz, with the widest ranges so that
  aggressive manoeuvres and vibration do not saturate the sensor.
- **The barometer is slow and smooth.** Altitude changes slowly, and raw pressure is noisy. Eight
  times oversampling together with the sensor's internal IIR filter brings altitude noise down to
  roughly 11 cm at a 50 Hz update rate, which is ample for an altitude loop.
- **The magnetometer averages.** Heading is corrected slowly, so eight-sample averaging trades
  bandwidth for a cleaner field measurement.

## How it is built

**Portable C with no dependencies.** The drivers do not depend on a particular HAL. They can be
used with the STM32 HAL or with bare-metal I2C and SPI routines on other ARM Cortex-M parts.

**Official drivers, ported cleanly.** The BMP388 and BMI160 drivers are Bosch's official
libraries. They are ported to STM32 through a separate port layer rather than by modifying the
vendor code. For the BMI160 the port layer provides:

| Function | Purpose |
|---|---|
| Bus read and write | I2C memory access routines handed to the Bosch driver |
| Delay | Millisecond delay callback |
| Interface init | Checks that the device answers, then applies range, rate, and bandwidth settings |
| Calibration | Averages samples over a chosen time to remove offsets |
| Combined read | Fetches accelerometer and gyroscope data in one call |

Keeping these in one file means a new vendor driver release can be dropped in without touching
application code.

**One project per sensor.** Each sensor has its own STM32CubeIDE project, so a driver can be
brought up and verified on the bench in isolation, with readings streamed to a PC over USB CDC,
before it is combined with the others.

## Planned additions

INA219 current monitor, BNO055 orientation sensor, BMP180 barometer, and HC-SR04 ultrasonic range
sensor.

## Relation to other projects

This library provides the sensor layer of the
[quadcopter flight software]({{ '/projects/quadcopter-flight-software/' | relative_url }}).

## Stack

C, STM32F407, STM32 HAL, I2C, SPI, external interrupts, USB CDC, STM32CubeIDE.

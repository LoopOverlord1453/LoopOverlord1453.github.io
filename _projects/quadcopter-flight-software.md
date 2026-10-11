---
layout: project
ref: quadcopter-flight-software
lang: en
title: Real-Time Quadcopter Flight Software
permalink: /projects/quadcopter-flight-software/
---

## The goal

Write the flight software for a quadcopter from the sensor drivers up, with a structure in which
each part can be developed and tested on its own instead of living inside one large `main.c`.

## Platform

| Item | Choice |
|---|---|
| Microcontroller | STM32F407VG (Cortex-M4F) |
| Operating system | FreeRTOS |
| Inertial sensor | BMI160, 6-axis accelerometer and gyroscope |
| Barometer | BMP388 |
| Magnetometer | HMC5883L |
| Motor outputs | Timer PWM channels driving the ESCs |
| PC link | USB CDC virtual serial port |
| Toolchain | STM32CubeIDE, STM32 HAL |

## Architecture

Every function of the aircraft is a separate library with its own `Inc` and `Src` folders. The
application layer only wires them together.

| Module | Contents |
|---|---|
| `SensorLibrary` | BMI160, BMP388, and HMC5883L drivers, each with a port layer |
| `SensorFusionLibrary` | Complementary filter, 1D Kalman filter, Madgwick AHRS, Mahony AHRS |
| `DigitalFilterLibrary` | FIR filter and first-order RC low-pass filter |
| `ControllerDriver` | PID controller with a standalone test program |
| `FlightInterfaceParser` | Packet and command parser for the flight command link |
| `FligthControl` | Structures that bind the sensors, the ESC outputs, and the command interface |
| `TaskHandles` | FreeRTOS task bodies |
| `QuadcopterModel` | Dynamic model of the vehicle, exported from Simulink as C code |
| `SoundEffect` | Buzzer tones for status feedback |

### Tasks and timing

Periodic tasks are scheduled with `vTaskDelayUntil` rather than `vTaskDelay`. The difference
matters for control: `vTaskDelay` waits a fixed time after the task body finishes, so the period
drifts with execution time, while `vTaskDelayUntil` wakes the task at fixed absolute instants. A
control loop and its estimator assume a constant sample time, and this is what provides it.

## Sensor layer

The BMI160 and BMP388 use Bosch's official drivers. Instead of editing vendor code, each sensor
has a thin port layer that supplies the bus read, bus write, and delay functions the driver
expects, along with initialization, calibration, and a combined accelerometer and gyroscope read.
Updating a vendor driver, or moving to another microcontroller, touches only the port file. The
BMP388 also ships with its self-test routine.

## Attitude estimation

Four approaches are implemented side by side so that they can be compared on the same hardware:

| Estimator | Character |
|---|---|
| Complementary filter | One blend factor between integrated gyroscope and accelerometer angles; cheapest to run |
| 1D Kalman filter | Scalar estimate with a gain computed from estimate and measurement error |
| Madgwick AHRS | Quaternion filter using gradient descent on accelerometer and magnetometer error |
| Mahony AHRS | Quaternion filter with proportional-integral feedback on the orientation error |

The complementary filter validates its inputs: a null pointer or a blend factor outside 0 to 1
calls the error handler instead of producing a wrong angle silently.

## Control

The PID controller is written for use in a real loop, not as a textbook formula:

| Feature | Why it is there |
|---|---|
| Derivative on measurement | A step in the setpoint does not produce a spike in the output |
| Band-limited derivative | A low-pass filter with time constant `tau` keeps sensor noise out of the derivative term |
| Integrator clamping | Anti-windup: the integrator stops growing when the output is saturated |
| Output limits | The command always stays inside the actuator's range |
| Explicit sample time | The controller is tied to the task period |

A separate test program runs the controller against a simulated first-order system, so its tuning
can be tried on a PC before it goes near a motor.

## Filtering

The FIR filter (a 10-tap circular buffer implementation) and the RC low-pass filter (parameterized
by cutoff frequency and sample time) are independent of the sensors. The same code can be applied
to gyroscope data, barometer data, or any other signal.

## Status

The drivers, estimators, filters, controller, and RTOS skeleton are in place. The command parser
and the flight control layer are defined but not yet complete, and the task bodies are still
placeholders. Integrating everything into a closed-loop flight controller is in progress; the
software has not been flight tested.

## Stack

C, STM32F407, FreeRTOS, STM32 HAL, I2C, PWM, USB CDC, STM32CubeIDE.

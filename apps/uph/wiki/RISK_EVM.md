# Unified Project Hub (UPH) - Risk & EVM Guide

This guide details the new Risk Management and Earned Value Management (EVM) features added to specific Projects.

## Risk Management (RAID Log)

The RAID Log helps project managers distinguish between different types of uncertainties and track them effectively.

### RAID Types

- **Risks**: Uncertain events that might happen. (E.g., "Supplier might delay delivery")
- **Assumptions**: Things we accept as true for planning. (E.g., "Permits will be approved by June")
- **Issues**: Problems that are happening _right now_. (E.g., "Server is down")
- **Dependencies**: Things we need from others or others need from us. (E.g., "Waiting for UI design")

### Using the RAID Log

1. Go to any Project Detail page.
2. Click the **"Risk & EVM"** tab.
3. Scroll to the "RAID Log" section.
4. Click **"Yeni Kayıt"** (New Entry) to add an item.
5. For Risks, you can set **Probability** (1-5) and **Impact** (1-5).

## Risk Matrix

The Risk Matrix visually maps your identified risks.

- **X-Axis**: Impact
- **Y-Axis**: Probability
- **Colors**:
  - 🔴 **Red**: High Priority (Score 15-25) - Needs immediate mitigation planning.
  - 🟡 **Yellow**: Medium Priority (Score 8-14) - Monitor closely.
  - 🟢 **Green**: Low Priority (Score 1-8) - Acceptable risk.

## Earned Value Management (EVM)

EVM provides objective metrics on project performance by combining scope, schedule, and cost.

### Key Metrics

- **PV (Planned Value)**: How much work _should_ have been done by now? (Budget)
- **EV (Earned Value)**: How much work is _actually_ done? (Value)
- **AC (Actual Cost)**: How much have we spent? (Cost)

### Performance Indexes

- **CPI (Cost Performance Index)**: `EV / AC`
  - `> 1.0`: Under Budget (Good) 🟢
  - `< 1.0`: Over Budget (Bad) 🔴
- **SPI (Schedule Performance Index)**: `EV / PV`
  - `> 1.0`: Ahead of Schedule (Good) 🟢
  - `< 1.0`: Behind Schedule (Bad) 🔴

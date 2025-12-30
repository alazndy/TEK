# Ecosystem Integrations

ENV-I is part of the TEK Ecosystem, interacting seamlessly with T-Weave and T-HUB (UPH).

## 🎨 T-Weave Integration

ENV-I can consume designs created in T-Weave.

- **Workflow**: A design template ID from Weave is assigned to a product in ENV-I.
- **Visuals**: Product details display design previews and links to the schematic in Weave.

## 📊 T-HUB (UPH) Integration

UPH serves as the management layer, while ENV-I provides the physical stock data.

- **BOM Management**: UPH projects pull product details and pricing from ENV-I.
- **Manual Overrides**: UPH can signal stock adjustments based on project utilization.
- **Financials**: Automatic cost calculations in UPH rely on real-time price data from ENV-I.

## 🔄 Cross-App Navigation

The `ecosystem-switcher.tsx` component allows users to jump between these applications quickly, maintaining the "Unified Hub" feel.

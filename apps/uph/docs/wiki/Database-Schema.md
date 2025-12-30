# Database Schema (UPH)

UPH leverages Firestore for real-time collaboration.

## 📊 Primary Collections

### `projects`

- `id`: Project identifier.
- `name`: Client/Project name.
- `status`: Active, Completed, Pending.
- `budget`: Allocated budget.
- `tasks`: Array of task references or sub-collection.

### `kanban`

- `boards`: Metadata for different project boards.
- `columns`: Status columns (To Do, In Progress, Done).
- `cards`: Individual task cards with priorities.

### `financials` (Often derived or sub-collection)

- `bom_items`: Linked items from ENV-I.
- `labor_costs`: Manual or tracked labor inputs.

## 🔗 Ecosystem Linkages

- **ENV-I Integration**: Product prices and stock levels are pulled from the ENV-I database to calculate project BOM costs.
- **Weave Integration**: Design files stored in Firebase or Drive are linked to specific project tasks.

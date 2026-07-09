export interface ReorderPatch {
  id: string;
  displayOrder: number;
}

// Spaced values (10, 20, 30, ...) rather than 1, 2, 3, ... so a later manual
// edit or an inserted item can slot in between two existing values without
// renumbering the whole category.
export function computeReorderPatches(orderedIds: string[]): ReorderPatch[] {
  return orderedIds.map((id, index) => ({
    id,
    displayOrder: (index + 1) * 10,
  }));
}

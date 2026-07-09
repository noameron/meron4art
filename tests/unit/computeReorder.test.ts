import { describe, expect, it } from 'vitest';
import { computeReorderPatches } from '@/sanity/tools/computeReorder';

describe('computeReorderPatches', () => {
  it('spaces displayOrder values by 10, starting at 10', () => {
    expect(computeReorderPatches(['a', 'b', 'c'])).toEqual([
      { id: 'a', displayOrder: 10 },
      { id: 'b', displayOrder: 20 },
      { id: 'c', displayOrder: 30 },
    ]);
  });

  it('handles a single-item category', () => {
    expect(computeReorderPatches(['only'])).toEqual([
      { id: 'only', displayOrder: 10 },
    ]);
  });

  it('handles an empty list', () => {
    expect(computeReorderPatches([])).toEqual([]);
  });

  it('reflects the new drag order, not the original id order', () => {
    expect(computeReorderPatches(['c', 'a', 'b'])).toEqual([
      { id: 'c', displayOrder: 10 },
      { id: 'a', displayOrder: 20 },
      { id: 'b', displayOrder: 30 },
    ]);
  });
});

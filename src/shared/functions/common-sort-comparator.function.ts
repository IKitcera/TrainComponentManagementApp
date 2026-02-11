/**
 * Generic sort comparator function for Material Sort
 * Compares two values of any type
 *
 * @param left - First value to compare
 * @param right - Second value to compare
 * @param isAsc - Sort direction (true for ascending, false for descending)
 * @returns Comparison result (-1, 0, or 1)
 *
 * @example
 * data.sort((a, b) => commonSortComparator(a.name, b.name, true));
 *
 * @example
 * // With Material Sort
 * const isAsc = sort.direction === 'asc';
 * data.sort((a, b) => commonSortComparator(a[sort.active], b[sort.active], isAsc));
 */
export function commonSortComparator(left: any, right: any, isAsc: boolean): number {
  // Handle null/undefined values
  if (left == null && right == null) return 0;
  if (left == null) return isAsc ? -1 : 1;
  if (right == null) return isAsc ? 1 : -1;

  // Handle boolean values
  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return (left === right ? 0 : left ? 1 : -1) * (isAsc ? 1 : -1);
  }

  // Handle number values
  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * (isAsc ? 1 : -1);
  }

  // Handle Date objects
  if (left instanceof Date && right instanceof Date) {
    return (left.getTime() - right.getTime()) * (isAsc ? 1 : -1);
  }

  // Handle string values (case-insensitive)
  const leftStr = String(left).toLowerCase();
  const rightStr = String(right).toLowerCase();

  return (leftStr < rightStr ? -1 : leftStr > rightStr ? 1 : 0) * (isAsc ? 1 : -1);
}

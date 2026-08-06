export const ELLIPSIS = "ellipsis" as const;
export type PageToken = number | typeof ELLIPSIS;

/**
 * Builds the classic `1 … 4 5 [6] 7 8 … 20` page-number sequence, always
 * including the first/last page and collapsing everything else that falls
 * outside `siblingCount` of the current page into a single ellipsis.
 */
export function getPageRange(current: number, totalPages: number, siblingCount = 1): PageToken[] {
  const totalNumbersShown = siblingCount * 2 + 5; // first + last + current + 2 ellipses

  if (totalPages <= totalNumbersShown) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1);
    return [...leftRange, ELLIPSIS, totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRangeLength = 3 + siblingCount * 2;
    const rightRange = Array.from({ length: rightRangeLength }, (_, i) => totalPages - rightRangeLength + i + 1);
    return [1, ELLIPSIS, ...rightRange];
  }

  const middleRange = Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i);
  return [1, ELLIPSIS, ...middleRange, ELLIPSIS, totalPages];
}

export interface SkeletonTextProps {
  /** Number of placeholder lines. @default 3 */
  lines?: number;
  /** Width of the final line, so paragraphs don't look like a solid block. @default "70%" */
  lastLineWidth?: string;
  className?: string;
}

export interface SkeletonCardProps {
  /** Shows a leading avatar circle above the title line. */
  showAvatar?: boolean;
  /** Shows a full-width image block above the content. */
  showImage?: boolean;
  /** Number of body text lines. @default 2 */
  lines?: number;
  className?: string;
}

export interface SkeletonTableProps {
  /** @default 5 */
  rows?: number;
  /** @default 4 */
  columns?: number;
  /** Renders a header row of shorter bars above the body rows. @default true */
  showHeader?: boolean;
  className?: string;
}

export interface SkeletonAvatarProps {
  /** @default "default" */
  size?: "sm" | "default" | "lg";
  className?: string;
}

export interface SkeletonChartProps {
  /** @default "bar" */
  variant?: "bar" | "line" | "pie";
  /** @default 160 */
  height?: number;
  className?: string;
}

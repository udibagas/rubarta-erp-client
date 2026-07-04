/**
 * Generate consistent color for avatars based on name
 * @param name - User name
 * @returns Hex color code
 */
export const getAvatarColor = (name: string | undefined | null): string => {
  if (!name) return "#909399";

  const colors = [
    "#409EFF", // blue
    "#67C23A", // green
    "#E6A23C", // orange
    "#F56C6C", // red
    "#9C27B0", // purple
    "#00BCD4", // cyan
    "#FF9800", // amber
    "#4CAF50", // material green
    "#2196F3", // material blue
    "#E91E63", // pink
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

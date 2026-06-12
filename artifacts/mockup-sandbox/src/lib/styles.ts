import type { LucideIcon } from "lucide-react";
import {
  Building2,
  LayoutGrid,
  Leaf,
  MinusSquare,
  Sofa,
  Sparkles,
} from "lucide-react";

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: [string, string];
  Icon: LucideIcon;
}

const iconMap: Record<string, LucideIcon> = {
  "square.grid.2x2": LayoutGrid,
  "sofa.fill": Sofa,
  "minus.square": MinusSquare,
  "leaf.fill": Leaf,
  "building.columns.fill": Building2,
  sparkles: Sparkles,
};

export function enrichStyle(style: {
  id: string;
  name: string;
  description: string;
  icon: string;
}): DesignStyle {
  const gradients: Record<string, [string, string]> = {
    modern: ["#EBEDF2", "#C7CCD6"],
    cozy: ["#F5E6D6", "#DBBDA3"],
    minimal: ["#F7F7FA", "#E0E0E6"],
    scandinavian: ["#F0F5ED", "#D1E0CC"],
    industrial: ["#DBDBD9", "#9E9E99"],
    luxe: ["#EDE6D6", "#C2AD8F"],
  };

  return {
    ...style,
    gradient: gradients[style.id] ?? ["#F5F5F7", "#E8E8ED"],
    Icon: iconMap[style.icon] ?? LayoutGrid,
  };
}

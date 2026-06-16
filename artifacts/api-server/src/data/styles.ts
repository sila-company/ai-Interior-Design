export interface StyleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const STYLE_CATALOG: StyleDefinition[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean lines, open space, and a calm neutral palette.",
    icon: "square.grid.2x2",
  },
  {
    id: "cozy",
    name: "Cozy",
    description: "Warm layers, soft textures, and inviting comfort.",
    icon: "sofa.fill",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet surfaces, intentional pieces, nothing extra.",
    icon: "minus.square",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Light woods, soft whites, and natural brightness.",
    icon: "leaf.fill",
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Raw materials, metal accents, and urban character.",
    icon: "building.columns.fill",
  },
  {
    id: "luxe",
    name: "Luxe",
    description: "Rich finishes, depth, and quietly elevated detail.",
    icon: "sparkles",
  },
];

export function listStyles(): StyleDefinition[] {
  return STYLE_CATALOG;
}

export function getStyleById(id: string): StyleDefinition | undefined {
  return STYLE_CATALOG.find((style) => style.id === id);
}

export function buildRedesignPrompt(
  style: StyleDefinition,
  roomContextLines: string[] = [],
): string {
  const lines = [
    `Transform this interior room into a ${style.name.toLowerCase()} design.`,
    style.description,
    ...roomContextLines,
    "Preserve the room layout, walls, windows, doors, ceiling, floor plan, and camera perspective.",
    "Update furniture, materials, colors, lighting, textiles, and decor to match the style.",
    "Photorealistic interior design photograph with natural lighting.",
  ];

  return lines.join(" ");
}

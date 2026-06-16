import type { rooms } from "@workspace/db";

type RoomPreferencesRecord = Pick<
  typeof rooms.$inferSelect,
  | "description"
  | "length"
  | "width"
  | "height"
  | "dimensionUnit"
  | "budgetAmount"
  | "budgetCurrency"
>;

export interface ParsedRoomPreferences {
  description: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: "meters" | "feet" | null;
  budgetAmount: number | null;
  budgetCurrency: string;
}

export function parseRoomPreferences(body: Record<string, unknown>): ParsedRoomPreferences {
  const description = String(body.description ?? "").trim() || null;

  const length = parsePositiveNumber(body.length);
  const width = parsePositiveNumber(body.width);
  const height = parsePositiveNumber(body.height);

  const rawUnit = String(body.dimensionUnit ?? "").trim().toLowerCase();
  const dimensionUnit =
    rawUnit === "meters" || rawUnit === "feet"
      ? rawUnit
      : length || width || height
        ? "meters"
        : null;

  const budgetAmount = parsePositiveInteger(body.budgetAmount);
  const budgetCurrency =
    String(body.budgetCurrency ?? "USD").trim().toUpperCase() || "USD";

  return {
    description,
    length,
    width,
    height,
    dimensionUnit,
    budgetAmount,
    budgetCurrency,
  };
}

export function roomPreferencesFromRecord(
  room: RoomPreferencesRecord,
): ParsedRoomPreferences {
  return {
    description: room.description,
    length: room.length,
    width: room.width,
    height: room.height,
    dimensionUnit: room.dimensionUnit as "meters" | "feet" | null,
    budgetAmount: room.budgetAmount,
    budgetCurrency: room.budgetCurrency ?? "USD",
  };
}

export function buildRoomContextLines(preferences: ParsedRoomPreferences): string[] {
  const lines: string[] = [];

  if (preferences.description) {
    lines.push(`Homeowner vision: ${preferences.description}`);
  }

  const unitLabel = preferences.dimensionUnit === "feet" ? "feet" : "meters";
  const unitAbbrev = preferences.dimensionUnit === "feet" ? "ft" : "m";

  if (preferences.length && preferences.width && preferences.height) {
    lines.push(
      `Room size: ${preferences.length} x ${preferences.width} x ${preferences.height} ${unitLabel} (length x width x height).`,
    );
  } else {
    const partial = [
      preferences.length ? `length ${preferences.length} ${unitAbbrev}` : null,
      preferences.width ? `width ${preferences.width} ${unitAbbrev}` : null,
      preferences.height ? `height ${preferences.height} ${unitAbbrev}` : null,
    ].filter(Boolean);

    if (partial.length > 0) {
      lines.push(`Room dimensions: ${partial.join(", ")}.`);
    }
  }

  if (preferences.budgetAmount) {
    lines.push(
      `Furnishing budget: about ${preferences.budgetCurrency} ${preferences.budgetAmount.toLocaleString("en-US")}. Stage realistic products and finishes that fit this budget.`,
    );
  }

  return lines;
}

function parsePositiveNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100) / 100;
}

function parsePositiveInteger(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

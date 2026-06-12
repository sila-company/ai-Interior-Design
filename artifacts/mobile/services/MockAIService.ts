const MOCK_AI_ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
];

export interface AIRoomResult {
  imageUrl: string;
  styleLabel: string;
  confidence: number;
  processingTime: number;
}

export class MockAIService {
  static async generateRoomDesign(
    _photoUri: string,
    stylePreference: string
  ): Promise<AIRoomResult> {
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const imageUrl =
      MOCK_AI_ROOM_IMAGES[Math.floor(Math.random() * MOCK_AI_ROOM_IMAGES.length)];

    return {
      imageUrl,
      styleLabel: stylePreference,
      confidence: 0.92 + Math.random() * 0.07,
      processingTime: 1800,
    };
  }

  static async analyzeRoomPhoto(
    _photoUri: string
  ): Promise<{ roomType: string; estimatedArea: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const roomTypes = ["Living Room", "Bedroom", "Dining Room", "Home Office"];
    return {
      roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      estimatedArea: `${Math.floor(180 + Math.random() * 120)} sq ft`,
    };
  }
}

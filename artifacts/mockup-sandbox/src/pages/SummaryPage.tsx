import { Package } from "lucide-react";
import { Redirect, useRoute } from "wouter";

import { AuthImage } from "@/components/AuthImage";
import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import {
  bundleProducts,
  displayCategory,
  priceText,
  shortTitle,
} from "@/lib/product-catalog";

function categoryIcon(category: string): string {
  switch (category) {
    case "bed_frame":
      return "🛏";
    case "nightstand":
    case "side_table":
      return "🪔";
    case "coffee_table":
    case "dresser":
      return "🪵";
    case "rug":
      return "▭";
    case "wall_art":
      return "🖼";
    case "accent_chair":
      return "🪑";
    default:
      return "📦";
  }
}

export function SummaryPage() {
  const [, params] = useRoute("/rooms/:roomId/summary");
  const { room, selectedStyle, beginGeneration } = useAppFlow();

  if (!room || room.id !== params?.roomId) {
    return <Redirect to="/rooms" />;
  }

  if (!selectedStyle) {
    return <Redirect to={`/rooms/${room.id}/style`} />;
  }

  const Icon = selectedStyle.Icon;
  const matchedProducts = bundleProducts(room.name, selectedStyle.id);
  const previewProducts = matchedProducts.slice(0, 4);

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Summary" backTo={`/rooms/${room.id}/style`} />

      <PageFrame className="flex-1">
        <div className="mb-6 max-w-3xl">
          <h2 className="mb-2 text-[30px] font-semibold text-[#1D1D1F]">
            Ready to redesign
          </h2>
          <p className="text-[17px] leading-7 text-[#6E6E73]">
            We will redesign <strong>{room.name}</strong> in a{" "}
            {selectedStyle.name.toLowerCase()} style using only matched
            shoppable products.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Surface className="overflow-hidden">
            <AuthImage
              src={room.originalImageUrl}
              alt={room.name}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-5">
              <p className="mb-2 text-[13px] font-medium uppercase text-[#6E6E73]">
                Your room
              </p>
              <h3 className="text-[22px] font-semibold text-[#1D1D1F]">
                {room.name}
              </h3>
            </div>
          </Surface>

          <div className="flex flex-col gap-4">
            <Surface className="p-5">
              <p className="mb-3 text-[13px] font-medium uppercase tracking-wider text-[#6E6E73]">
                Style
              </p>
              <div className="mb-6 flex items-center gap-3.5">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${selectedStyle.gradient[0]}, ${selectedStyle.gradient[1]})`,
                  }}
                >
                  <Icon className="h-[22px] w-[22px] text-[#1D1D1F]/60" />
                </div>
                <div>
                  <p className="text-[17px] font-semibold text-[#1D1D1F]">
                    {selectedStyle.name}
                  </p>
                  <p className="text-[14px] text-[#6E6E73]">
                    {selectedStyle.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={beginGeneration}
                className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
              >
                Generate redesign
              </button>
            </Surface>

            {previewProducts.length > 0 && (
              <Surface className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#0071E3]" />
                  <p className="text-[13px] font-medium uppercase tracking-wider text-[#6E6E73]">
                    Shoppable products
                  </p>
                </div>

                <div className="space-y-3">
                  {previewProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="relative h-[42px] w-[42px] flex-shrink-0 overflow-hidden rounded-[10px] bg-[#0071E3]/[0.08]">
                        <img
                          src={product.imageURL}
                          alt={shortTitle(product)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <span
                          className="absolute inset-0 hidden items-center justify-center text-[18px]"
                          aria-hidden="true"
                        >
                          {categoryIcon(product.category)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[#6E6E73]">
                          {displayCategory(product)}
                        </p>
                        <p className="truncate text-[15px] font-semibold text-[#1D1D1F]">
                          {shortTitle(product)}
                        </p>
                      </div>

                      <p className="flex-shrink-0 text-[13px] font-medium text-[#1D1D1F]">
                        {priceText(product)}
                      </p>
                    </div>
                  ))}

                  {matchedProducts.length > 4 && (
                    <p className="pt-1 text-[13px] font-medium text-[#6E6E73]">
                      + {matchedProducts.length - 4} more matched products
                    </p>
                  )}
                </div>
              </Surface>
            )}
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

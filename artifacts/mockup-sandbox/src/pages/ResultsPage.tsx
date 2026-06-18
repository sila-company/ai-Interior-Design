import { ArrowUpRight } from "lucide-react";
import { Redirect, useRoute } from "wouter";

import { BeforeAfterCompare } from "@/components/BeforeAfterCompare";
import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAppFlow } from "@/context/AppFlowContext";
import {
  ShoppableProduct,
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

function ProductCard({ product }: { product: ShoppableProduct }) {
  return (
    <a
      href={product.affiliateURL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3.5 rounded-[20px] border border-black/[0.06] bg-white p-3.5 shadow-[0_5px_10px_rgba(0,0,0,0.04)] transition hover:shadow-md"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[14px] bg-black/[0.04]">
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
          className="absolute inset-0 hidden items-center justify-center text-[22px]"
          aria-hidden="true"
        >
          {categoryIcon(product.category)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-[#0071E3]/[0.08] px-2 py-1 text-[12px] font-medium text-[#0071E3]">
            {displayCategory(product)}
          </span>
          <span className="text-[12px] font-medium text-[#6E6E73]">
            {product.retailer}
          </span>
        </div>
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#1D1D1F]">
          {shortTitle(product)}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[#1D1D1F]">
            {priceText(product)}
          </span>
          {product.color && (
            <span className="truncate text-[13px] text-[#6E6E73]">
              · {product.color}
            </span>
          )}
        </div>
      </div>

      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[#6E6E73]" />
    </a>
  );
}

export function ResultsPage() {
  const [, params] = useRoute("/rooms/:roomId/results");
  const {
    room,
    selectedStyle,
    redesignedImageUrl,
    savedRedesignId,
    tryAnotherStyle,
    startOver,
  } = useAppFlow();

  if (!room || room.id !== params?.roomId || !redesignedImageUrl) {
    return <Redirect to="/rooms" />;
  }

  const matchedProducts = selectedStyle
    ? bundleProducts(room.name, selectedStyle.id)
    : [];

  const shareImage = async () => {
    try {
      if (navigator.share) {
        const response = await fetch(redesignedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], "atelier-redesign.png", {
          type: blob.type || "image/png",
        });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "Atelier redesign",
            text: `My ${room.name} redesign`,
            files: [file],
          });
          return;
        }
      }
    } catch {
      // fall through to download
    }

    const link = document.createElement("a");
    link.href = redesignedImageUrl;
    link.download = `atelier-${room.name}.png`;
    link.click();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Results" showBack={false} />

      <PageFrame className="flex-1">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="mb-6">
              <h2 className="mb-2 text-[30px] font-semibold text-[#1D1D1F]">
                {room.name}
              </h2>
              {selectedStyle ? (
                <p className="text-[17px] text-[#6E6E73]">
                  {savedRedesignId
                    ? `${selectedStyle.name} style - saved to your account.`
                    : `${selectedStyle.name} style saved to your account.`}
                </p>
              ) : null}
            </div>

            <BeforeAfterCompare
              beforeSrc={room.originalImageUrl}
              afterSrc={redesignedImageUrl}
            />

            <p className="mt-4 text-center text-[14px] text-[#6E6E73]">
              Drag the slider to compare your original room with the redesign.
            </p>

            {matchedProducts.length > 0 && (
              <div className="mt-10">
                <div className="mb-2">
                  <h3 className="text-[22px] font-semibold text-[#1D1D1F]">
                    Shop this room
                  </h3>
                  <p className="mt-1 text-[14px] text-[#6E6E73]">
                    These real Amazon products were matched to your room style.
                    Prices and availability may change.
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {matchedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <p className="mt-4 text-[12px] text-[#86868B]">
                  As an Amazon Associate, Atelier may earn from qualifying
                  purchases.
                </p>
              </div>
            )}
          </section>

          <Surface className="h-fit p-5">
            <p className="mb-3 text-[13px] font-medium uppercase text-[#6E6E73]">
              Next steps
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void shareImage()}
                className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white"
              >
                Share redesign
              </button>

              <button
                type="button"
                onClick={tryAnotherStyle}
                className="w-full rounded-full bg-[#0071E3]/[0.06] px-4 py-3.5 text-[15px] font-medium text-[#0071E3]"
              >
                Try another style
              </button>

              <button
                type="button"
                onClick={startOver}
                className="w-full rounded-full bg-black/[0.04] px-4 py-3.5 text-[15px] font-medium text-[#1D1D1F]"
              >
                Back to rooms
              </button>
            </div>
          </Surface>
        </div>
      </PageFrame>
    </div>
  );
}

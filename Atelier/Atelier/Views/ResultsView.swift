import Photos
import SwiftUI

struct ResultsView: View {
    @Environment(AppFlow.self) private var flow

    @State private var saveState: SaveState = .idle
    @State private var showShareSheet = false
    @State private var revisionInstruction = ""
    @State private var isRevising = false
    @State private var revisionError: String?

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    private enum SaveState: Equatable {
        case idle
        case saving
        case saved
        case failed(String)
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                header

                if let original = flow.roomImage, let redesigned = flow.redesignedImage {
                    BeforeAfterCompareView(
                        beforeImage: original,
                        afterImage: redesigned
                    )

                    Text("Drag the slider to compare your original room with the redesign.")
                        .font(.system(size: 14))
                        .foregroundStyle(secondaryText)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                }

                if !displayedProducts.isEmpty {
                    shoppableProductsSection
                }

                iterationSection

                actionButtons

                if case .failed(let message) = saveState {
                    Text(message)
                        .font(.system(size: 14))
                        .foregroundStyle(.red)
                        .frame(maxWidth: .infinity, alignment: .center)
                } else if case .saved = saveState {
                    Text("Saved to your photo library.")
                        .font(.system(size: 14))
                        .foregroundStyle(secondaryText)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("Results")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .sheet(isPresented: $showShareSheet) {
            if let redesigned = flow.redesignedImage {
                ShareSheet(items: [redesigned])
            }
        }
    }

    private var iterationSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Adjust the design")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(primaryText)

                Text("Tell Atelier what to change. It will regenerate using only live inventory products.")
                    .font(.system(size: 14))
                    .foregroundStyle(secondaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }

            TextField("Example: make it warmer, use less wall art", text: $revisionInstruction, axis: .vertical)
                .font(.system(size: 15))
                .lineLimit(2...4)
                .padding(14)
                .background(Color.black.opacity(0.04), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                .disabled(isRevising)

            Button {
                reviseDesign()
            } label: {
                HStack(spacing: 8) {
                    if isRevising {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "wand.and.sparkles")
                    }
                    Text(isRevising ? "Updating design" : "Update redesign")
                }
                .font(.system(size: 15, weight: .medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(.plain)
            .foregroundStyle(.white)
            .background(canRevise ? appleBlue : appleBlue.opacity(0.35), in: Capsule())
            .disabled(!canRevise)

            if let revisionError {
                Text(revisionError)
                    .font(.system(size: 13))
                    .foregroundStyle(.red)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        }
        .shadow(color: .black.opacity(0.04), radius: 10, y: 5)
    }

    private var canRevise: Bool {
        !isRevising &&
        flow.room != nil &&
        flow.selectedStyle != nil &&
        !revisionInstruction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private var displayedProducts: [ShoppableProduct] {
        var seenCategories = Set<String>()
        return flow.selectedProducts.filter { product in
            let category = product.category.lowercased()
            guard !seenCategories.contains(category) else { return false }
            seenCategories.insert(category)
            return true
        }
    }

    private var shoppableProductsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Shop this room")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(primaryText)

                Text("These real products were selected for this redesign. Prices and availability may change.")
                    .font(.system(size: 14))
                    .foregroundStyle(secondaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }

            VStack(spacing: 12) {
                ForEach(displayedProducts) { product in
                    productCard(product)
                }
            }

            Text("As an Amazon Associate, Atelier may earn from qualifying purchases.")
                .font(.system(size: 12))
                .foregroundStyle(secondaryText)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 2)
        }
    }

    private func productCard(_ product: ShoppableProduct) -> some View {
        Link(destination: product.affiliateURL) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.black.opacity(0.04))

                    AsyncImage(url: product.imageURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                        default:
                            Image(systemName: productIcon(for: product.category))
                                .font(.system(size: 23, weight: .light))
                                .foregroundStyle(appleBlue)
                        }
                    }
                }
                .frame(width: 64, height: 64)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

                VStack(alignment: .leading, spacing: 5) {
                    HStack(spacing: 8) {
                        Text(product.displayCategory)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(appleBlue)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(appleBlue.opacity(0.08), in: Capsule())

                        Text(product.retailer)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(secondaryText)
                    }

                    Text(product.shortTitle)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(primaryText)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)

                    HStack(spacing: 6) {
                        Text(product.priceText)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(primaryText)

                        Text("· \(product.color)")
                            .font(.system(size: 13))
                            .foregroundStyle(secondaryText)
                            .lineLimit(1)
                    }
                }

                Spacer(minLength: 8)

                Image(systemName: "arrow.up.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(secondaryText)
            }
            .padding(14)
            .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Color.black.opacity(0.06), lineWidth: 1)
            }
            .shadow(color: .black.opacity(0.04), radius: 10, y: 5)
        }
        .buttonStyle(.plain)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Your redesign")
                .font(.system(size: 28, weight: .semibold))
                .tracking(-0.5)
                .foregroundStyle(primaryText)

            if let style = flow.selectedStyle {
                Text("\(style.name) style applied to your room.")
                    .font(.system(size: 17))
                    .foregroundStyle(secondaryText)
            }
        }
    }

    private var actionButtons: some View {
        VStack(spacing: 12) {
            Button {
                saveToPhotos()
            } label: {
                Group {
                    if case .saving = saveState {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text(saveButtonTitle)
                    }
                }
                .font(.system(size: 15, weight: .medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(.plain)
            .foregroundStyle(.white)
            .background(appleBlue, in: Capsule())
            .disabled(saveState == .saving || flow.redesignedImage == nil)

            Button {
                showShareSheet = true
            } label: {
                Text("Share redesign")
                    .font(.system(size: 15, weight: .medium))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.plain)
            .foregroundStyle(appleBlue)
            .background(appleBlue.opacity(0.06), in: Capsule())
            .disabled(flow.redesignedImage == nil)

            Button {
                flow.tryAnotherStyle()
            } label: {
                Text("Try another style")
                    .font(.system(size: 15, weight: .medium))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.plain)
            .foregroundStyle(primaryText)
            .background(Color.black.opacity(0.04), in: Capsule())

            Button {
                flow.startOver()
            } label: {
                Text("Back to home")
                    .font(.system(size: 15))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
            }
            .buttonStyle(.plain)
            .foregroundStyle(secondaryText)
        }
    }

    private var saveButtonTitle: String {
        if case .saved = saveState {
            return "Saved"
        }
        return "Save to Photos"
    }

    private func productIcon(for category: String) -> String {
        switch category {
        case "bed_frame":
            return "bed.double"
        case "nightstand", "side_table":
            return "lamp.table"
        case "coffee_table", "dresser":
            return "square.grid.2x2"
        case "rug":
            return "rectangle"
        case "wall_art":
            return "photo"
        case "accent_chair":
            return "chair.lounge"
        default:
            return "shippingbox"
        }
    }

    private func saveToPhotos() {
        guard let redesigned = flow.redesignedImage else { return }

        saveState = .saving

        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                DispatchQueue.main.async {
                    saveState = .failed("Photo access was denied.")
                }
                return
            }

            PHPhotoLibrary.shared().performChanges {
                PHAssetChangeRequest.creationRequestForAsset(from: redesigned)
            } completionHandler: { success, error in
                DispatchQueue.main.async {
                    if success {
                        saveState = .saved
                    } else {
                        saveState = .failed(error?.localizedDescription ?? "Could not save photo.")
                    }
                }
            }
        }
    }

    private func reviseDesign() {
        guard let room = flow.room, flow.hasStyleChoice else { return }

        let instruction = revisionInstruction.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !instruction.isEmpty else { return }

        isRevising = true
        revisionError = nil

        Task {
            do {
                let result = try await AtelierAPIService().generateRedesign(
                    roomId: room.id,
                    style: flow.selectedStyle,
                    customStyleDescription: flow.customStyleDescription,
                    revisionInstruction: instruction
                )
                await MainActor.run {
                    flow.selectedProducts = result.products
                    flow.redesignedImage = result.image
                    revisionInstruction = ""
                    isRevising = false
                    saveState = .idle
                }
            } catch {
                await MainActor.run {
                    revisionError = error.localizedDescription
                    isRevising = false
                }
            }
        }
    }
}

#Preview {
    let flow = AppFlow()
    flow.roomImage = UIImage(systemName: "photo")
    flow.redesignedImage = UIImage(systemName: "photo.fill")
    flow.selectedStyle = .catalog[0]
    flow.selectedProducts = ProductCatalog.bundle(for: "Living room", style: .catalog[0])

    return NavigationStack {
        ResultsView()
            .environment(flow)
    }
}

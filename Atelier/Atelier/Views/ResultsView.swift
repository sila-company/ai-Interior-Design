import Photos
import SwiftUI

struct ResultsView: View {
    @Environment(AppFlow.self) private var flow

    @State private var saveState: SaveState = .idle
    @State private var showShareSheet = false

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
                Text("Start over")
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
}

#Preview {
    let flow = AppFlow()
    flow.roomImage = UIImage(systemName: "photo")
    flow.redesignedImage = UIImage(systemName: "photo.fill")
    flow.selectedStyle = .catalog[0]

    return NavigationStack {
        ResultsView()
            .environment(flow)
    }
}

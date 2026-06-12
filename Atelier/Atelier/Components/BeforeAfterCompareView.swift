import SwiftUI

struct BeforeAfterCompareView: View {
    let beforeImage: UIImage
    let afterImage: UIImage

    @State private var sliderPosition: CGFloat = 0.5

    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            let dividerX = width * sliderPosition

            ZStack(alignment: .leading) {
                Image(uiImage: afterImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: width, height: height)
                    .clipped()

                Image(uiImage: beforeImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: width, height: height)
                    .clipped()
                    .mask(alignment: .leading) {
                        Rectangle().frame(width: dividerX)
                    }

                Rectangle()
                    .fill(.white.opacity(0.95))
                    .frame(width: 2, height: height)
                    .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 0)
                    .offset(x: dividerX - 1)

                Circle()
                    .fill(.white)
                    .frame(width: 36, height: 36)
                    .shadow(color: .black.opacity(0.15), radius: 8, y: 2)
                    .overlay {
                        Image(systemName: "arrow.left.and.right")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))
                    }
                    .offset(x: dividerX - 18)

                VStack {
                    HStack {
                        label("Before")
                        Spacer()
                        label("After")
                    }
                    Spacer()
                }
                .padding(12)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        let position = value.location.x / width
                        sliderPosition = min(max(position, 0.05), 0.95)
                    }
            )
        }
        .aspectRatio(4 / 3, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        }
        .shadow(color: .black.opacity(0.08), radius: 24, y: 12)
    }

    private func label(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 12, weight: .semibold))
            .textCase(.uppercase)
            .tracking(1)
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(.black.opacity(0.45), in: Capsule())
    }
}

#Preview {
    BeforeAfterCompareView(
        beforeImage: UIImage(systemName: "photo")!,
        afterImage: UIImage(systemName: "photo.fill")!
    )
    .padding()
}

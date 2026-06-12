import SwiftUI

struct StyleCard: View {
    let style: DesignStyle
    let isSelected: Bool
    let onTap: () -> Void

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                ZStack(alignment: .topTrailing) {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: style.gradient,
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(height: 88)
                        .overlay {
                            Image(systemName: style.icon)
                                .font(.system(size: 28, weight: .light))
                                .foregroundStyle(primaryText.opacity(0.55))
                        }

                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 22))
                            .foregroundStyle(appleBlue)
                            .background(Circle().fill(.white))
                            .padding(8)
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(style.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(primaryText)

                    Text(style.description)
                        .font(.system(size: 12))
                        .foregroundStyle(secondaryText)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(12)
            .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(
                        isSelected ? appleBlue : Color.black.opacity(0.06),
                        lineWidth: isSelected ? 2 : 1
                    )
            }
            .shadow(color: .black.opacity(isSelected ? 0.10 : 0.05), radius: isSelected ? 16 : 10, y: 6)
            .scaleEffect(isSelected ? 1.02 : 1)
            .animation(.easeOut(duration: 0.2), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    StyleCard(style: .catalog[0], isSelected: true, onTap: {})
        .padding()
}

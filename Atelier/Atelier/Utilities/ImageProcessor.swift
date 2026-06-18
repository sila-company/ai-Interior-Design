import UIKit

enum ImageProcessor {
    static func jpegDataForUpload(
        from image: UIImage,
        maxDimension: CGFloat = 1280,
        compressionQuality: CGFloat = 0.72
    ) -> Data? {
        let resized = resize(image, maxDimension: maxDimension)
        return resized.jpegData(compressionQuality: compressionQuality)
    }

    static func pngDataForUpload(from image: UIImage, maxDimension: CGFloat = 1536) -> Data? {
        let resized = resize(image, maxDimension: maxDimension)
        return resized.pngData()
    }

    private static func resize(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let size = image.size
        let longestSide = max(size.width, size.height)

        guard longestSide > maxDimension else { return image }

        let scale = maxDimension / longestSide
        let newSize = CGSize(width: size.width * scale, height: size.height * scale)

        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
        }
    }
}

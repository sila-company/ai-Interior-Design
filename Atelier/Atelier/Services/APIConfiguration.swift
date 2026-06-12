import Foundation

enum APIConfiguration {
    static var apiBaseURL: URL? {
        guard let url = Bundle.main.url(forResource: "Secrets", withExtension: "plist"),
              let data = try? Data(contentsOf: url),
              let plist = try? PropertyListSerialization.propertyList(from: data, format: nil) as? [String: Any],
              let rawValue = plist["API_BASE_URL"] as? String,
              !rawValue.isEmpty,
              rawValue != "your-api-base-url-here" else {
            return nil
        }

        var normalized = rawValue
        while normalized.hasSuffix("/") {
            normalized.removeLast()
        }

        return URL(string: normalized)
    }
}

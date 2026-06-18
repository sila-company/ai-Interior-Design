import Foundation

enum APIConfiguration {
    /// Standard API calls (auth, room list, uploads).
    static let standardTimeout: TimeInterval = 120

    /// AI redesigns can take several minutes on the server.
    static let redesignTimeout: TimeInterval = 600

    static let standardSession: URLSession = {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = standardTimeout
        configuration.timeoutIntervalForResource = standardTimeout + 60
        configuration.waitsForConnectivity = true
        return URLSession(configuration: configuration)
    }()

    static let redesignSession: URLSession = {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = redesignTimeout
        configuration.timeoutIntervalForResource = redesignTimeout + 120
        configuration.waitsForConnectivity = true
        return URLSession(configuration: configuration)
    }()

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

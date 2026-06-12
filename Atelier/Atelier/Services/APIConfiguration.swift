import Foundation

enum APIConfiguration {
    static var openAIAPIKey: String? {
        guard let url = Bundle.main.url(forResource: "Secrets", withExtension: "plist"),
              let data = try? Data(contentsOf: url),
              let plist = try? PropertyListSerialization.propertyList(from: data, format: nil) as? [String: Any],
              let key = plist["OPENAI_API_KEY"] as? String,
              !key.isEmpty,
              key != "your-openai-api-key-here" else {
            return nil
        }
        return key
    }
}

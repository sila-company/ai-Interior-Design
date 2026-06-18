import app from "../artifacts/api-server/dist/serverless.mjs";

export default function handler(req, res) {
  const url = new URL(req.url ?? "/api", `https://${req.headers.host ?? "localhost"}`);
  const path = url.searchParams.get("path");

  if (path) {
    url.searchParams.delete("path");
    const query = url.searchParams.toString();
    req.url = `/api/${path}${query ? `?${query}` : ""}`;
  } else if (req.url === "/" || req.url?.startsWith("/?")) {
    req.url = `/api${req.url.slice(1)}`;
  }

  return app(req, res);
}

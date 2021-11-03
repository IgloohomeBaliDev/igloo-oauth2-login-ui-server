class CORSHandler {
  constructor() {}

  init(allowedUrls, allowedHeaders, req) {
    const currentUrlHost = req.headers.host;
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "OPTIONS, POST, GET, PATCH, DELETE",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": 86400,
    };

    if (
      typeof allowedUrls === "object" &&
      Array.isArray(allowedUrls) &&
      typeof allowedHeaders === "object" &&
      Array.isArray(allowedHeaders)
    ) {
      if (allowedUrls.includes(currentUrlHost)) {
        headers["access-control-allow-methods"] = currentUrlHost;
      }

      headers["access-control-allow-headers"] = allowedHeaders.join(",");

      return headers;
    } else {
      return headers;
    }
  }
}

export default CORSHandler;

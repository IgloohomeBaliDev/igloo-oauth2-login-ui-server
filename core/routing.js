class RoutingHandler {
  pathAndRun = [];

  constructor() {}

  init(method, path, run) {
    this.pathAndRun = [
      ...this.pathAndRun,
      {
        method: method,
        path: path,
        run: run,
      },
    ];
  }

  get(path, run) {
    this.init("GET", path, run);
  }

  post(path, run) {
    this.init("POST", path, run);
  }

  patch(path, run) {
    this.init("PATCH", path, run);
  }

  delete(path, run) {
    this.init("DELETE", path, run);
  }

  run(req, res, corsRule) {
    // OPTIONS Request / pre-flight
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsRule);
      res.end();
      return;
    }

    const urlSplitter = req.url.split("?");
    const reqMethod = req.method;
    let endpointFound = false;

    this.pathAndRun.map((data) => {
      if (urlSplitter[0] === data.path && reqMethod === data.method) {
        endpointFound = true;
        return data.run();
      }
    });

    if (!endpointFound) {
      res.writeHead(404, corsRule);
      res.end(
        JSON.stringify({
          message: "Endpoint not found",
          detail: {
            endpoint: req.url,
          },
        })
      );
      return;
    }
  }
}

export default RoutingHandler;

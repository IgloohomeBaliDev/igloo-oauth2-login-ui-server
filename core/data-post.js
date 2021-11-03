class DataPost {
  constructor() {}

  get(req) {
    return new Promise((resolve) => {
      if (req.method == "POST") {
        let bodyChunks = [];

        req.on("data", (chunk) => {
          return bodyChunks.push(chunk);
        });
        req.on("end", () => {
          const data = Buffer.concat(bodyChunks);
          try {
            const objectData = JSON.parse(data.toString());
            resolve(objectData);
          } catch (_) {
            resolve(data.toString());
          }
        });
      }
    });
  }
}

export default DataPost;

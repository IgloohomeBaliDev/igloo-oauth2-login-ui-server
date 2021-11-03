import http from "http";
import CORSHandler from "./core/cors.js";
import RoutingHandler from "./core/routing.js";
import PartnerAPIEndpoint from "./endpoint/partner-api.js";

// CORS
const corsAllowedUrls = ["http://localhost:5000", "http://localhost:5001"];
const corsAllowedHeaders = ["content-type", "authorization"];
const corsHandler = new CORSHandler();

// Routing
const routingHandler = new RoutingHandler();

// Endpoint
const partnerAPI = new PartnerAPIEndpoint();

const requestListener = (req, res) => {
  const corsRule = corsHandler.init(corsAllowedUrls, corsAllowedHeaders, req);

  // POST - Proxied to AWS Hosted UI with Puppeteer
  routingHandler.post("/igloo/oauth2/login", () => {
    partnerAPI.postProxiedLoginEndpoint(req, res, corsRule);
  });

  // Run routing
  routingHandler.run(req, res, corsRule);
};

const host = "localhost";
const port = 5002;
const server = http.createServer(requestListener);
server.listen(port, host);

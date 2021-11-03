import dotenv from "dotenv";
import { URL } from "url";
import got from "got";
import DataPost from "../core/data-post.js";
import puppeteer from "puppeteer";

dotenv.config();

const dataPost = new DataPost();
const baseUrlIglooPartner = process.env.PARTNER_API_BASE_URL;
const iglooPartnerAPIKey = process.env.IGLOO_API_KEY;

class PartnerAPIEndpoint {
  constructor() {}

  async puppeteerWebResponse(page) {
    return new Promise((resolve) => {
      page.on("response", (response) => {
        const status = response.status();
        if (status >= 300 && status <= 399) {
          resolve({
            url: response.url(),
            urlLocation: response.headers()["location"],
            status: status,
          });
        } else {
          resolve({
            status: status,
          });
        }
      });
    });
  }

  // Post Proxied
  async postProxiedLoginEndpoint(req, res, corsRule) {
    const requestBody = await dataPost.get(req);

    const baseUrl = req.headers.host;
    const reqUrl = new URL(`${baseUrl}${req.url}`);

    const hostUrl = "igloohome.auth.ap-southeast-1.amazoncognito.com";
    const clientId = !!reqUrl.searchParams.get("clientId")
      ? reqUrl.searchParams.get("clientId")
      : "clientId";
    const redirectUri = !!reqUrl.searchParams.get("redirectUri")
      ? reqUrl.searchParams.get("redirectUri")
      : "redirectUri";

    const oauthEmail = requestBody["email"];
    const oauthPass = requestBody["password"];

    const hostedUIUrl = `https://${hostUrl}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

    // Puppeteer on AWS Lamda -> https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: "/opt/homebrew/bin/chromium",
    });

    try {
      const page = await browser.newPage();
      await page.goto(hostedUIUrl, {
        waitUntil: "networkidle0",
      });

      // Wait for input to loaded
      await page.waitForSelector("#signInFormUsername");
      await page.waitForSelector("#signInFormPassword");

      // Fill the input
      await page.$eval(
        "#signInFormUsername",
        (el, oauthEmail) => (el.value = oauthEmail),
        oauthEmail
      );
      await page.$eval(
        "#signInFormPassword",
        (el, oauthPass) => (el.value = oauthPass),
        oauthPass
      );

      // Click submit button
      await page.click("input[name='signInSubmitButton']");

      // Redirect
      const puppeteerRes = await this.puppeteerWebResponse(page);

      // Check error login
      let response = {};
      const oauthCode = puppeteerRes.urlLocation.split("?")[1].split("=")[1];
      if (oauthCode === "code&client_id") {
        // Wait for error
        await page.waitForSelector("#loginErrorMessage");
        const loginErrorMessage = await page.$eval(
          "#loginErrorMessage",
          (el) => {
            return el.innerText;
          }
        );

        if (!!loginErrorMessage) {
          if (
            loginErrorMessage.includes("Incorrect username or password") ||
            loginErrorMessage.includes("PreAuthentication failed")
          ) {
            response = {
              statusCode: "ERR_INCORRECT_USER_PASS",
              errorMessage: "Incorrect username or password",
            };
          }
        }
      } else {
        response = {
          statusCode: "SUCCESS",
          oauthCode: oauthCode,
        };
      }

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200, corsRule);
      res.end(
        JSON.stringify({
          payload: response,
        })
      );
    } catch (e) {
      let httpStatus = 500;

      if (!!e.response) {
        if (!!e.response.statusCode) {
          httpStatus = e.response.statusCode;
        }
      }

      res.setHeader("Content-Type", "application/json");
      res.writeHead(httpStatus, corsRule);
      res.end(
        JSON.stringify({
          error: {
            message: e.message,
          },
        })
      );
    }

    // Close browser
    await browser.close();
    return;
  }
}

export default PartnerAPIEndpoint;

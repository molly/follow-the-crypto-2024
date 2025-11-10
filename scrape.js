import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const PAGES = [
  "/2024/elections/AK-H-01",
  "/2024/elections/AL-H-02",
  "/2024/elections/AR-H-02",
  "/2024/elections/AZ-H-06",
  "/2024/elections/AZ-H-08",
  "/2024/elections/AZ-S",
  "/2024/elections/CA-H-17",
  "/2024/elections/CA-H-34",
  "/2024/elections/CA-H-40",
  "/2024/elections/CO-H-07",
  "/2024/elections/CO-H-08",
  "/2024/elections/DE-H-01",
  "/2024/elections/GA-H-03",
  "/2024/elections/IL-H-13",
  "/2024/elections/IL-H-17",
  "/2024/elections/IN-H-08",
  "/2024/elections/IN-S",
  "/2024/elections/KY-H-06",
  "/2024/elections/MA-S",
  "/2024/elections/MD-H-02",
  "/2024/elections/MI-H-04",
  "/2024/elections/MI-H-13",
  "/2024/elections/MN-H-02",
  "/2024/elections/MN-H-06",
  "/2024/elections/MO-H-01",
  "/2024/elections/MO-H-03",
  "/2024/elections/NC-H-01",
  "/2024/elections/NC-H-08",
  "/2024/elections/NC-H-13",
  "/2024/elections/NC-H-14",
  "/2024/elections/NE-H-01",
  "/2024/elections/NJ-H-05",
  "/2024/elections/NJ-H-08",
  "/2024/elections/NV-H-04",
  "/2024/elections/NY-H-03",
  "/2024/elections/NY-H-05",
  "/2024/elections/NY-H-10",
  "/2024/elections/NY-H-15",
  "/2024/elections/NY-H-16",
  "/2024/elections/NY-H-18",
  "/2024/elections/NY-H-26",
  "/2024/elections/OK-H-04",
  "/2024/elections/SC-H-04",
  "/2024/elections/SD-H-01",
  "/2024/elections/TX-H-12",
  "/2024/elections/TX-H-32",
  "/2024/elections/UT-S",
  "/2024/elections/VA-H-07",
  "/2024/elections/VA-H-10",
  "/2024/elections/WA-H-06",
  "/2024/elections/WI-H-01",
  "/2024/elections/WV-H-02",
];

const OUTPUT_DIR = "./dist-static";

const BASE_URL = "http://localhost:3000";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const sanitizePath = (p) => (p === "/" ? "index.html" : `${p.replace(/^\//, "").replace(/\/$/, "")}.html`);

const snapshot = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const route of PAGES) {
    const url = `${BASE_URL}${route}`;
    console.log(`Rendering ${url}`);
    await page.goto(url);

    // optional delay if some things load very slowly
    await delay(5000);

    const html = await page.content();

    // Load into cheerio and strip scripts
    const $ = cheerio.load(html);
    $("script").remove();
    $("next-route-announcer").remove();
    $("link[as='script']").remove();
    const strippedHtml = $.html();

    const outPath = path.join(OUTPUT_DIR, sanitizePath(route));
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, strippedHtml);
    console.log(`Saved to ${outPath}`);
  }

  await browser.close();
};

snapshot();

import fs from "fs/promises";
import { createRequire } from "module";
import path from "path";
import prettier from "prettier";
const require = createRequire(import.meta.url);
const cheerio = require("cheerio");

const DIST_DIR = "./dist";
const FONT_EXTENSIONS = [".woff2", ".woff", ".ttf", ".otf"];
const REPLACEMENT_URL = "/assets/font.woff2";

const getAllHtmlFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? getAllHtmlFiles(res) : res.endsWith(".html") ? [res] : [];
    })
  );
  return files.flat();
};

const isFontUrl = (url) => {
  if (!url) return false;
  try {
    const pathname = new URL(url, "http://dummy").pathname;
    return FONT_EXTENSIONS.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
};

const replaceFontReferences = async () => {
  const files = await getAllHtmlFiles(DIST_DIR);
  for (const file of files) {
    const html = await fs.readFile(file, "utf-8");
    const $ = cheerio.load(html);
    let changed = false;

    // Replace in <link href=...>
    $("link[href]").each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (isFontUrl(href)) {
        $el.attr("href", REPLACEMENT_URL);
        changed = true;
      }
    });

    // Replace in <script src=...> (rare for fonts, but included for completeness)
    $("script[src]").each((_, el) => {
      const $el = $(el);
      const src = $el.attr("src");
      if (isFontUrl(src)) {
        $el.attr("src", REPLACEMENT_URL);
        changed = true;
      }
    });

    // Replace in <style> blocks or inline <style> attributes
    $("style").each((_, el) => {
      const $el = $(el);
      let text = $el.html();
      if (FONT_EXTENSIONS.some((ext) => text.includes(ext))) {
        text = text.replace(/url\(([^)]+)\)/g, (match, url) => (isFontUrl(url) ? `url(${REPLACEMENT_URL})` : match));
        $el.html(text);
        changed = true;
      }
    });

    $("[style]").each((_, el) => {
      const $el = $(el);
      let style = $el.attr("style");
      if (FONT_EXTENSIONS.some((ext) => style.includes(ext))) {
        style = style.replace(/url\(([^)]+)\)/g, (match, url) => (isFontUrl(url) ? `url(${REPLACEMENT_URL})` : match));
        $el.attr("style", style);
        changed = true;
      }
    });

    if (changed) {
      const formatted = await prettier.format($.html(), { parser: "html" });
      await fs.writeFile(file, formatted);
      console.log(`Updated fonts in: ${file}`);
    }
  }
};

replaceFontReferences().catch(console.error);

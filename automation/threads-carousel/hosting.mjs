import { setTimeout as delay } from "node:timers/promises";

export async function verifyPublicImages(
  urls,
  { fetchImpl = globalThis.fetch, sleep = delay, attempts = 18 } = {},
) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error("No public carousel image URLs were provided");
  }

  for (const url of urls) {
    if (!String(url).startsWith("https://")) {
      throw new Error(`Public media URL must use HTTPS: ${url}`);
    }

    let lastStatus = "no response";
    let verified = false;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetchImpl(url, {
          method: "GET",
          headers: { Range: "bytes=0-32" },
          signal: AbortSignal.timeout(15_000),
        });
        lastStatus = String(response.status);
        const contentType = response.headers?.get?.("content-type") ?? "";
        if (response.ok && contentType.toLowerCase().includes("image/png")) {
          verified = true;
          break;
        }
      } catch (error) {
        lastStatus = error.message;
      }
      await sleep(Math.min(5_000 * attempt, 20_000));
    }

    if (!verified) {
      throw new Error(
        `Carousel image is not publicly available as PNG (${lastStatus}): ${url}`,
      );
    }
  }
}

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json" } });

const OK_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default async (req) => {
  const pin = process.env.APP_PIN;
  if (pin && req.headers.get("x-app-pin") !== pin) return json({ error: "bad_pin" }, 401);
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const { text = "", images = [], today = "" } = await req.json();
  const content = [];
  for (const im of images.slice(0, 2)) {
    if (!im?.data) continue;
    content.push({
      type: "image",
      source: { type: "base64", media_type: OK_TYPES.includes(im.type) ? im.type : "image/jpeg", data: im.data },
    });
  }
  content.push({
    type: "text",
    text: `You read expense receipts for a dental lab field rep who supports full-arch implant surgeries chairside.
Extract the purchase and reply with JSON only, no other text:
{"item": "short description of what was bought, e.g. Hotel 1 night, Airfare, Rental car, Fuel, Meals, Parking, Rideshare, Supplies",
 "date": "YYYY-MM-DD of the purchase, or empty string",
 "location": "merchant name plus city and state if shown, or empty string",
 "total": grand total actually paid including tax and tip as a number, or null}
Today is ${String(today).slice(0, 10)}. If the year is missing, assume the most recent past date.` +
      (text ? `\n\nReceipt text:\n${String(text).slice(0, 8000)}` : "") +
      (content.length ? `\n\nThe attached image(s) show the receipt.` : ""),
  });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
      max_tokens: 400,
      messages: [{ role: "user", content }],
    }),
  });
  if (!r.ok) return json({ error: "api", status: r.status }, 502);

  const d = await r.json();
  const t = (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
  try {
    return json(JSON.parse(t.match(/\{[\s\S]*\}/)[0]));
  } catch {
    return json({});
  }
};

export const config = { path: "/api/read-receipt" };

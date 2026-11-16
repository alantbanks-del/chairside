import { getStore } from "@netlify/blobs";

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json" } });

export default async (req) => {
  const pin = process.env.APP_PIN;
  if (pin && req.headers.get("x-app-pin") !== pin) return json({ error: "bad_pin" }, 401);

  const store = getStore({ name: "chairside", consistency: "strong" });
  const id = new URL(req.url).searchParams.get("id");

  if (req.method === "GET") {
    const { blobs } = await store.list({ prefix: "job/" });
    const jobs = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    return json({ jobs });
  }
  if (!id || !/^[\w-]{1,64}$/.test(id)) return json({ error: "bad_id" }, 400);
  if (req.method === "PUT") {
    const body = await req.json();
    body.id = id;
    await store.setJSON("job/" + id, body);
    return json({ ok: true });
  }
  if (req.method === "DELETE") {
    await store.delete("job/" + id);
    return json({ ok: true });
  }
  return json({ error: "method" }, 405);
};

export const config = { path: "/api/jobs" };

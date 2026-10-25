export function resolvePostAuthPath(search: string): string {
  const params = new URLSearchParams(
    search.startsWith("?") || search.length === 0 ? search : `?${search}`
  );
  const next = params.get("next");
  const intent = params.get("intent");
  const safe =
    next && next.startsWith("/") && !next.startsWith("//") && !next.includes("://")
      ? next
      : "/dashboard";

  if (intent === "subscribe" && (safe === "/pricing" || safe.startsWith("/pricing?"))) {
    if (safe.includes("intent=")) return safe;
    return safe.includes("?") ? `${safe}&intent=subscribe` : `${safe}?intent=subscribe`;
  }

  return safe;
}

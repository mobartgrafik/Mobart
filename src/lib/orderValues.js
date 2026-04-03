// Centralne wartości domenowe dla zleceń.
// Dzięki temu UI i filtry używają spójnych stringów (a stare dane da się „znormalizować”).

export const ORDER_STATUSES = ["Nowe", "W trakcie", "Do przekazania", "Wydrukowane", "Zakończone"];

export function normalizeOrderStatus(status) {
  const s = String(status || "").trim();
  if (!s) return s;
  // Legacy/alias: w starszych wersjach UI było "Przekazane".
  if (s === "Przekazane") return "Wydrukowane";
  return s;
}

export const ORDER_PRIORITIES = ["niski", "średni", "wysoki"];

export function normalizeOrderPriority(priority) {
  const p = String(priority || "").trim();
  if (!p) return p;

  // Legacy: starsze UI używało wielkich liter.
  if (p === "Niski") return "niski";
  if (p === "Normalny") return "średni";
  if (p === "Wysoki") return "wysoki";
  if (p === "Pilne") return "wysoki"; // brak osobnego "pilne" w aktualnym formularzu

  // Canonical already.
  return p.toLowerCase();
}


import { NextResponse } from "next/server";

const API_BASE_URL = "https://ve.dolarapi.com/v1/historicos";
const currencyPaths = {
  USD: "dolares",
  EUR: "euros"
};

function getCaracasDate() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23"
  });
  const parts = Object.fromEntries(formatter.formatToParts().map(({ type, value }) => [type, value]));
  const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));

  if (Number(parts.hour) >= 19) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}

export async function GET(request) {
  const currency = new URL(request.url).searchParams.get("moneda")?.toUpperCase();

  if (currency !== "USD" && currency !== "EUR") {
    return NextResponse.json({ message: "Indica una moneda válida: USD o EUR." }, { status: 400 });
  }

  try {
    const date = getCaracasDate();
    const response = await fetch(`${API_BASE_URL}/${currencyPaths[currency]}/oficial/${date}`, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json({ message: "No fue posible consultar las cotizaciones." }, { status: 502 });
    }

    const quote = await response.json();
    return NextResponse.json({
      ...quote,
      moneda: currency,
      nombre: currency === "USD" ? "Dólar" : "Euro",
      fechaActualizacion: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ message: "No fue posible conectar con el servicio." }, { status: 503 });
  }
}
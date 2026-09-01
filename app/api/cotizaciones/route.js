import { NextResponse } from "next/server";

const API_BASE_URL = "https://ve.dolarapi.com/v1/historicos";
const currencyPaths = {
  USD: "dolares",
  EUR: "euros"
};
const BINANCE_P2P_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

function getCaracasDate(retry = false) {
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

  if (Number(parts.hour) >= 19 && !retry) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}

export async function GET(request) {
  const currency = new URL(request.url).searchParams.get("moneda")?.toUpperCase();

  if (currency !== "USD" && currency !== "EUR" && currency !== "USDT") {
    return NextResponse.json({ message: "Indica una moneda válida: USD, EUR o USDT." }, { status: 400 });
  }

  try {
    if (currency === "USDT") {
      const response = await fetch(BINANCE_P2P_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0"
        },
        body: JSON.stringify({ asset: "USDT", fiat: "VES", merchantCheck: false, page: 1, rows: 10, tradeType: "BUY" }),
        cache: "no-store"
      });

      if (!response.ok) {
        return NextResponse.json({ message: "No fue posible consultar Binance P2P." }, { status: 502 });
      }

      const { data } = await response.json();
      const prices = data.map(({ adv }) => Number(adv.price)).filter(Number.isFinite).sort((first, second) => first - second);
      const middle = Math.floor(prices.length / 2);
      const average = prices.length % 2 ? prices[middle] : (prices[middle - 1] + prices[middle]) / 2;

      if (!Number.isFinite(average)) {
        return NextResponse.json({ message: "Binance P2P no devolvió anuncios para USDT/VES." }, { status: 502 });
      }

      return NextResponse.json({ moneda: "USDT", nombre: "USDT", fuente: "Binance P2P (promedio)", compra: null, venta: null, promedio: average, fechaActualizacion: new Date().toISOString() });
    }

    const date = getCaracasDate();
    const response = await fetch(`${API_BASE_URL}/${currencyPaths[currency]}/oficial/${date}`, { cache: "no-store" });

    if (!response.ok) {
      if (response.status === 404) {
        const retryDate = getCaracasDate(true);
        const retryResponse = await fetch(`${API_BASE_URL}/${currencyPaths[currency]}/oficial/${retryDate}`, { cache: "no-store" });
        if (!retryResponse.ok) {
          return NextResponse.json({ message: "No fue posible consultar las cotizaciones." }, { status: 502 });
        }
        const quote = await retryResponse.json();
        return NextResponse.json({
          ...quote,
          moneda: currency,
          nombre: currency === "USD" ? "Dólar" : "Euro",
          fechaActualizacion: new Date().toISOString()
        });
      }
      return NextResponse.json({ message: "No fue posible consultar las cotizaciones." }, { status: 502 });
    }

    const quote = await response.json();
    return NextResponse.json({
      ...quote,
      moneda: currency,
      nombre: currency === "USD" ? "Dólar" : "Euro",
      fechaActualizacion: new Date().toISOString()
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "No fue posible conectar con el servicio." }, { status: 503 });
  }
}
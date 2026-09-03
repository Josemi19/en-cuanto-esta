import { NextResponse } from "next/server";
import { getCacheData } from "../../lib/scraperBcv";

const BINANCE_P2P_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

export async function GET(request) {
  const currency = new URL(request.url).searchParams.get("moneda")?.toUpperCase();

  if (currency !== "USD" && currency !== "EUR" && currency !== "USDT") {
    return NextResponse.json({ message: "Indica una moneda válida: USD, EUR o USDT." }, { status: 400 });
  }

  try {
    // BINANCE P2P USDT/VES
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

      return NextResponse.json({ moneda: "USDT", nombre: "USDT", fuente: "Binance P2P (promedio)", promedio: average, fechaActualizacion: new Date().toISOString() });
    }

    // BCV USD/EUR

    const response = await getCacheData();

    if (!response) {
      return NextResponse.json({ message: "No fue posible consultar las cotizaciones." }, { status: 502 });
    }

    const quote = response;
    return NextResponse.json([
      {
        moneda: "USD",
        nombre: "Dólar",
        fuente: "BCV",
        promedio: quote.dolar,
        fechaActualizacion: new Date().toISOString()
      },
      {
        moneda: "EUR",
        nombre: "Euro",
        fuente: "BCV",
        promedio: quote.euro,
        fechaActualizacion: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "No fue posible conectar con el servicio." }, { status: 503 });
  }
}
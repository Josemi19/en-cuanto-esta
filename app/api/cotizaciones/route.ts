import { NextResponse } from "next/server";

const API_URL = "https://ve.dolarapi.com/v1/cotizaciones";

export async function GET() {
  try {
    const response = await fetch(API_URL, { next: { revalidate: 300 } });

    if (!response.ok) {
      return NextResponse.json({ message: "No fue posible consultar las cotizaciones." }, { status: 502 });
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ message: "No fue posible conectar con el servicio." }, { status: 503 });
  }
}
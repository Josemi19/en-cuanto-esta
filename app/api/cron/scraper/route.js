// app/api/cron/scraper/route.ts
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getCacheData } from '../../../lib/scraperBcv';

export async function GET(request) {
    // 1. Verificación de seguridad (proporcionado automáticamente por Vercel)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        // 2. Invalida la caché guardada previamente
        revalidateTag('datos-scraper');

        // 3. Ejecuta la función para poblar de inmediato la nueva caché
        const nuevosDatos = await getCacheData();

        return NextResponse.json({
            success: true,
            mensaje: 'Scraper ejecutado y caché actualizada',
            data: nuevosDatos,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error durante el scraping' },
            { status: 500 }
        );
    }
}
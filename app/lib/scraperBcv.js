// app/lib/scraper.ts
import { unstable_cache } from 'next/cache';
import * as cheerio from 'cheerio';
import https from 'node:https';
import axios from 'axios';

// Lógica de scraping con Cheerio
export async function getScraper() {
    // Agent que ignora errores de certificado SSL/TLS
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const response = await axios.get('https://www.bcv.org.ve/', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        httpsAgent: agent,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let valorDolar = null;
    let valorEuro = null;

    // Extrae la información necesaria según la estructura del sitio
    const dolarDiv = $('#dolar');

    if (dolarDiv.length) {
        valorDolar = $(dolarDiv).find('strong').text().trim();
    }

    const euroDiv = $('#euro');
    if (euroDiv.length) {
        valorEuro = $(euroDiv).find('strong').text().trim();
    }

    return {
        dolar: interpretarValorMonetario(valorDolar),
        euro: interpretarValorMonetario(valorEuro),
        actualizadoEl: new Date().toISOString(),
    };
}

function interpretarValorMonetario(valor) {
    const limpio = valor
        .replace(/\s/g, '')
        .replace(',', '.')

    return Number.parseFloat(limpio)
}

// Función cacheada que consumirán tus páginas y Server Components
export const getCacheData = unstable_cache(
    async () => getScraper(),
    ['scraper-data-key'],
    {
        tags: ['datos-scraper'], // Etiqueta para revalidar la caché
    }
);
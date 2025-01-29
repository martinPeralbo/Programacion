// filepath: /c:/Users/peral/Desktop/Programacion/NODE_SCRAPPING/server.js
const express = require('express');
const { chromium } = require('playwright');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    

    const urls = [
        { url: 'https://www.instant-gaming.com/es/16944-comprar-playstation-store-astro-bot-playstation-5-juego-playstation-store/', name: 'ASTRO BOT' },
        { url: 'https://www.instant-gaming.com/es/7930-comprar-monster-hunter-wilds-pc-juego-steam-europe/', name: 'MONSTER HUNTER' },
        { url: 'https://www.instant-gaming.com/es/13083-comprar-steam-silent-hill-2-pc-juego-steam-europe/', name: 'Silent hill 2' }
    ];

    const results = [];

    for (const { url, name } of urls) {
        await page.goto(url);
        let content = await page.textContent('[class="amount"]');
        let precio = null;

        if (content.includes('€')) {
            precio = await page.textContent('[class="total"]');
        }

        results.push({ name, precio: precio || content });
    }

    await browser.close();

    res.render('index', { results });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
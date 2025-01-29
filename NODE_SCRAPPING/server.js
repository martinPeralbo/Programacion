const express = require('express');
const { chromium } = require('playwright');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Ir a la página de tendencias para obtener los enlaces a los juegos
    await page.goto('https://www.instant-gaming.com/es/tendencias/');
    
    // Obtener los enlaces a los juegos, el nombre, el precio y la imagen desde la página de tendencias
    const gameLinks = await page.$$eval('div.item.force-badge', items => {
        return items.map(item => {
            const linkElement = item.querySelector('a.cover.video.is-playable.played');
            const nameElement = item.querySelector('.information .name .title');
            const priceElement = item.querySelector('.information .price');
            const imageElement = item.querySelector('img.picture');

            return {
                url: linkElement ? linkElement.href : null,  // URL del juego
                name: nameElement ? nameElement.textContent.trim() : null, // Nombre del juego
                price: priceElement ? priceElement.textContent.trim() : null, // Precio del juego
                imageUrl: imageElement ? imageElement.getAttribute('src') : null // URL de la imagen
            };
        });
    });

    await browser.close();

    res.render('index', { results: gameLinks });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
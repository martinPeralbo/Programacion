const express = require('express');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

const dataFilePath = path.join(__dirname, 'gameData.json');

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
                price: priceElement ? parseFloat(priceElement.textContent.trim().replace('€', '')) : null, // Precio del juego
                imageUrl: imageElement ? imageElement.getAttribute('src') : null // URL de la imagen
            };
        });
    });

    await browser.close();

    // Leer datos anteriores del fichero
    let previousData = {};
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath);
        previousData = JSON.parse(rawData);
    }

    // Actualizar datos con la información actual
    const updatedData = gameLinks.map(game => {
        const previousGameData = previousData[game.name] || { minPrice: game.price, maxPrice: game.price, url: game.url, imageUrl: game.imageUrl };
        return {
            ...game,
            minPrice: Math.min(game.price, previousGameData.minPrice),
            maxPrice: Math.max(game.price, previousGameData.maxPrice),
            url: game.url || previousGameData.url,
            imageUrl: game.imageUrl || previousGameData.imageUrl
        };
    });

    // Guardar datos actualizados en el fichero
    const dataToSave = updatedData.reduce((acc, game) => {
        acc[game.name] = game;
        return acc;
    }, {});
    fs.writeFileSync(dataFilePath, JSON.stringify(dataToSave, null, 2));

    res.render('index', { results: updatedData });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
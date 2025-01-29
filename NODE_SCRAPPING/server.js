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

    // Capturar mensajes de consola del navegador
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Ir a la página de tendencias para obtener los enlaces a los juegos
    await page.goto('https://www.instant-gaming.com/es/tendencias/');
    
    // Obtener los enlaces a los juegos, el nombre, el precio y la imagen desde la página de tendencias
    const gameLinks = await page.$$eval('div.item.force-badge', items => {
        return items.map(item => {
            const linkElement = item.querySelector('.cover');
            console.log('URL:' + linkElement);
            const nameElement = item.querySelector('.information .name .title');
            const priceElement = item.querySelector('.information .price');
            const imageElement = item.querySelector('img.picture');

            // Log variables to the browser console
            console.log('URL:', linkElement ? linkElement.getAttribute('href') : null);
            console.log('Name:', nameElement ? nameElement.textContent.trim() : null);
            console.log('Price:', priceElement ? priceElement.textContent.trim().replace('€', '').replace(',', '.') : null);
            console.log('Image URL:', imageElement ? imageElement.getAttribute('src') : null);

            return {
                url: linkElement ? linkElement.getAttribute('href') : null,  // URL del juego
                name: nameElement ? nameElement.textContent.trim() : null, // Nombre del juego
                price: priceElement ? priceElement.textContent.trim().replace('€', '').replace(',', '.') : null, // Precio del juego como texto
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
        const previousGameData = previousData[game.name] || { minPrice: game.price, maxPrice: game.price, url: game.url, imageUrl: game.imageUrl, lastSeen: null };
        const actualPrice = Math.round(parseFloat(game.price));
        const minPrice = Math.round(parseFloat(previousGameData.minPrice));
        const maxPrice = Math.round(parseFloat(previousGameData.maxPrice));
        let priceClass = '';
        if (!isNaN(actualPrice) && !isNaN(minPrice) && !isNaN(maxPrice)) {
            if (actualPrice < minPrice) {
                priceClass = 'lower';
            } else if (actualPrice > maxPrice) {
                priceClass = 'higher';
            } else {
                priceClass = 'equal';
            }
        }
        return {
            ...game,
            minPrice: Math.min(parseFloat(game.price), parseFloat(previousGameData.minPrice)),
            maxPrice: Math.max(parseFloat(game.price), parseFloat(previousGameData.maxPrice)),
            url: game.url || previousGameData.url,
            imageUrl: game.imageUrl || previousGameData.imageUrl,
            priceClass,
            lastSeen: new Date().toISOString() // Actualizar la fecha y hora actuales
        };
    });

    // Guardar datos actualizados en el fichero
    const dataToSave = updatedData.reduce((acc, game) => {
        acc[game.name] = game;
        return acc;
    }, {});
    fs.writeFileSync(dataFilePath, JSON.stringify(dataToSave, null, 2));

    // Leer datos acumulados del fichero
    const accumulatedData = JSON.parse(fs.readFileSync(dataFilePath));

    res.render('index', { results: Object.values(accumulatedData) });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
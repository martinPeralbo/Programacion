const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
    const page = await browser.newPage();

    const urls = [
        { url: 'https://www.instant-gaming.com/es/16944-comprar-playstation-store-astro-bot-playstation-5-juego-playstation-store/', name: 'ASTRO BOT' },
        { url: 'https://www.instant-gaming.com/es/7930-comprar-monster-hunter-wilds-pc-juego-steam-europe/', name: 'MONSTER HUNTER' },
        { url: 'https://www.instant-gaming.com/es/13083-comprar-steam-silent-hill-2-pc-juego-steam-europe/', name: 'Silent hill 2' }
    ];

    for (const { url, name } of urls) {
        await page.goto(url);
        let content = await page.textContent('[class="amount"]');
        let precio = null;

        if (content.includes('€')) {
            precio = await page.textContent('[class="total"]');
        }

        console.log(`${name}: ${precio || content}`);
    }

    await browser.close();
})();
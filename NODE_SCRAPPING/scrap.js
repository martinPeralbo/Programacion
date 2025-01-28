// const assert = require('node:assert');

const { chromium, devices } = require('playwright');




(async() => {

    let content

    const browser = await chromium.launch({executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'},)
    let page = await browser.newPage()



    // await page.goto('https://www.instant-gaming.com/es/16944-comprar-playstation-store-astro-bot-playstation-5-juego-playstation-store/')
    // content = await page.textContent('[class="total"]')
    // console.log(content)
  
    await page.goto('https://www.instant-gaming.com/es/16944-comprar-playstation-store-astro-bot-playstation-5-juego-playstation-store/')
    content = await page.textContent('[class="amount"]')
    if (content.includes('€')) {
        precio = await page.textContent('[class="total"]')
    }
    
    console.log('ASTRO BOT: ' + content)
    precio =null
    

    await page.goto('https://www.instant-gaming.com/es/7930-comprar-monster-hunter-wilds-pc-juego-steam-europe/')
    content = await page.textContent('[class="amount"]')
    if (content.includes('€')) {
        precio = await page.textContent('[class="total"]')
    }
    console.log('MONSTER HUNTER: ' + precio)
    precio =null

    await page.goto('https://www.instant-gaming.com/es/13083-comprar-steam-silent-hill-2-pc-juego-steam-europe/')
    content = await page.textContent('[class="amount"]')
    if (content.includes('€')) {
        precio = await page.textContent('[class="total"]')
    }
    console.log('Silent hill 2: ' + precio)
    precio =null



    
        
    await browser.close()

})()


// boton sp-cc-accept
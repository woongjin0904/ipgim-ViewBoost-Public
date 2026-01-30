module.exports = async (page, url) => {
    const isM = url.includes('m.instiz.net');
    
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.setUserAgent(isM 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' 
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        await page.setViewport(isM 
            ? { width: 375, height: 812, isMobile: true, hasTouch: true } 
            : { width: 1440, height: 900 });

        const referer = isM ? 'https://m.instiz.net/' : 'https://www.instiz.net/';
        await page.setExtraHTTPHeaders({ 
            'referer': referer,
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

        const randomX = isM ? 180 : 400;
        const randomY = isM ? 250 : 350;
        await page.mouse.click(randomX, randomY + Math.random() * 50); 
        
        await page.evaluate(async () => {
            const totalScroll = 600 + Math.floor(Math.random() * 400);
            const step = 100;
            for (let i = 0; i < totalScroll; i += step) {
                window.scrollBy({ top: step, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 300)); 
            }
        });

        const stayTime = 7000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("인스티즈 부스팅 에러:", e.message);
        return false;
    }
};
module.exports = async (page, url) => {
    const isM = url.includes('m.ppomppu.co.kr');

    try {

        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.setUserAgent(isM 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' 
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.setViewport(isM 
            ? { width: 390, height: 844, isMobile: true, hasTouch: true } 
            : { width: 1440, height: 900 });

        const boardId = url.split('id=')[1]?.split('&')[0];
        let referer = isM ? 'https://m.ppomppu.co.kr/' : 'https://www.ppomppu.co.kr/';
        if (boardId) {
            referer += isM ? `zboard.php?id=${boardId}` : `zboard/zboard.php?id=${boardId}`;
        }

        await page.setExtraHTTPHeaders({ 
            'referer': referer,
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

        await page.evaluate(async () => {
            const scrollHeight = document.body.scrollHeight;
            const targetDepth = scrollHeight * (0.5 + Math.random() * 0.3); 
            const step = 200;
            
            for (let i = 0; i < targetDepth; i += step) {
                window.scrollBy({ top: step, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 200 + Math.random() * 150));
            }
        });

        await page.mouse.click(150 + Math.random() * 100, 200 + Math.random() * 100);

        const stayTime = 5000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("뽐뿌 부스팅 에러:", e.message);
        return false;
    }
};
module.exports = async (page, url, log) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const boardUrl = pathParts.length > 0 
            ? `${urlObj.origin}/${pathParts[0]}` 
            : urlObj.origin;

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({ 
            'referer': boardUrl, 
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
            'upgrade-insecure-requests': '1'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        if (log) log(`[DIMITORY] 게시글 접속 완료 (Referer: ${pathParts[0] || 'Home'})`);

        await page.evaluate(async () => {
            const distance = 120; 
            const delay = 180;
            const scrollLimit = document.body.scrollHeight * (0.6 + Math.random() * 0.3); // 60~90% 지점까지

            while (window.scrollY + window.innerHeight < scrollLimit) {
                window.scrollBy(0, distance);
                await new Promise(r => setTimeout(r, delay + Math.random() * 50));
                
                if (Math.random() > 0.85) {
                    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
                }
            }
        });

        const x = 200 + Math.floor(Math.random() * 300);
        const y = 400 + Math.floor(Math.random() * 300);
        await page.mouse.click(x, y);

        const stayTime = 20000 + Math.floor(Math.random() * 15000); 
        if (log) log(`[DIMITORY] 데이터 반영 대기 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (log) log(`[DIMITORY 에러] ${e.message}`);
        return false;
    }
};
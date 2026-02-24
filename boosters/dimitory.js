module.exports = async (page, url, log) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const boardUrl = `${urlObj.origin}/${pathParts[0]}`; 

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        if (log) log(`[DIMITORY] 보안 우회를 위해 목록 접속 중: ${pathParts[0]}`);
        await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

        await page.setExtraHTTPHeaders({ 'referer': boardUrl });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        if (log) log(`[DIMITORY] 게시글 진입 완료`);

        await page.evaluate(async () => {
            const distance = 100;
            const delay = 200;
            const scrollTarget = document.scrollingElement.scrollHeight * (0.5 + Math.random() * 0.4);
            
            while (document.scrollingElement.scrollTop + window.innerHeight < scrollTarget) {
                window.scrollBy(0, distance);
                await new Promise(r => setTimeout(r, delay + Math.random() * 100));
                
                if (Math.random() > 0.9) await new Promise(r => setTimeout(r, 1500));
            }
        });

        await page.mouse.click(300 + Math.random() * 200, 400 + Math.random() * 200);

        const stayTime = 25000 + Math.floor(Math.random() * 15000); 
        if (log) log(`[DIMITORY] 서버 기록 대기 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (log) log(`[DIMITORY 에러] ${e.message}`);
        return false;
    }
};
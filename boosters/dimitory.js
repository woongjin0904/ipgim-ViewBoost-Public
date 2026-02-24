module.exports = async (page, url, log) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const boardUrl = `${urlObj.origin}/${pathParts[0]}`;
        const articleId = pathParts[1];

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        if (log) log(`[DIMITORY] 목록 페이지 접속 중: ${boardUrl}`);
        await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

        const linkSelector = `a[href*="${articleId}"]`;
        const hasLink = await page.$(linkSelector);

        if (hasLink) {
            if (log) log(`[DIMITORY] 목록에서 게시글 발견. 클릭하여 이동합니다.`);
            await Promise.all([
                page.click(linkSelector),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 40000 })
            ]);
        } else {
            if (log) log(`[DIMITORY] 목록에 글이 없어 직접 이동합니다.`);
            await page.setExtraHTTPHeaders({ 'referer': boardUrl });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
        }

        
        await page.evaluate(async () => {
            const scrollSteps = 5 + Math.floor(Math.random() * 5);
            for (let i = 0; i < scrollSteps; i++) {
                const distance = 200 + Math.random() * 300;
                window.scrollBy({ top: distance, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
            }
        });

        await page.mouse.click(200 + Math.random() * 200, 300 + Math.random() * 200);
        
        const stayTime = 28000 + Math.floor(Math.random() * 12000); 
        if (log) log(`[DIMITORY] 서버 반영 대기 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (log) log(`[DIMITORY 에러] ${e.message}`);
        return false;
    }
};
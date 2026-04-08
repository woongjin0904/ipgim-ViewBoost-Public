module.exports = async (page, url, addLog) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const boardUrl = pathParts.length > 1
            ? `${urlObj.origin}/${pathParts[0]}/${pathParts[1]}`
            : urlObj.origin;

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

        await page.setExtraHTTPHeaders({
            'referer': boardUrl,
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

        await page.evaluate(async () => {
            const content = document.querySelector('.post-content') || document.body;
            if (content) content.scrollIntoView({ behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 1500));

            const totalHeight = document.body.scrollHeight;
            const scrollPoint = Math.min(totalHeight, 600 + Math.random() * 500);

            window.scrollTo({
                top: scrollPoint,
                behavior: 'smooth'
            });
        });

        const x = 150 + Math.floor(Math.random() * 300);
        const y = 250 + Math.floor(Math.random() * 300);
        await page.mouse.click(x, y);

        const stayTime = 7000 + Math.floor(Math.random() * 5000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (addLog) addLog(`[FANCUG] Error: ${e.message}`);
        return false;
    }
};
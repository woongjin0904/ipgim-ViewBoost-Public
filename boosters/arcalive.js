module.exports = async (page, url) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        const channelUrl = url.split('/').slice(0, 5).join('/'); 
        await page.setExtraHTTPHeaders({ 'referer': channelUrl || 'https://arca.live/' });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });

        await page.waitForSelector('.article-wrapper', { timeout: 15000 }).catch(() => {});

        await page.evaluate(async () => {
            window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 1000));
        });

        const stayTime = 7000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("아카라이브 부스터 에러:", e.message);
        return false;
    }
};
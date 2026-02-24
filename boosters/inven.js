module.exports = async (page, url) => {
    try {
        const urlParts = url.split('/');
        const articleId = urlParts[urlParts.length - 1]; 
        const boardUrl = urlParts.slice(0, -1).join('/');

        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        const linkSelector = `a[href*="/${articleId}"]`;
        const linkHandle = await page.waitForSelector(linkSelector, { timeout: 10000 }).catch(() => null);

        if (linkHandle) {
            await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, linkSelector);
            await new Promise(r => setTimeout(r, 1500));
            
            await Promise.all([
                page.click(linkSelector),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
            ]);
        } else {
            await page.setExtraHTTPHeaders({ 'referer': boardUrl });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        }

        await page.evaluate(async () => {
            for(let i=0; i < 4; i++) {
                window.scrollBy(0, 300);
                await new Promise(r => setTimeout(r, 1500));
            }
        });

        await new Promise(r => setTimeout(r, 20000));
        return true;
    } catch (e) {
        console.error("[INVEN Booster Error]:", e.message);
        return false;
    }
};
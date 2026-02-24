module.exports = async (page, url) => {
    try {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const galleryId = urlParams.get('id');
        let referer = 'https://www.dcinside.com/';
        
        if (galleryId) {
            const gallType = url.includes('mgallery') ? 'mgallery/' : (url.includes('mini') ? 'mini/' : '');
            referer = `https://gall.dcinside.com/${gallType}board/lists/?id=${galleryId}`;
        }
        
        await page.setExtraHTTPHeaders({ 'referer': referer });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 });
        
        await page.waitForFunction(() => !!document.querySelector('.title_subject'), { timeout: 15000 }).catch(() => {});

        await page.evaluate(async () => {
            window.scrollBy({ top: 500 + Math.random() * 300, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 2000));
        });
        await page.mouse.click(150 + Math.random() * 100, 200 + Math.random() * 100);

        const stayTime = 6000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("[DCINSIDE Module Error]:", e.message);
        return false;
    }
};
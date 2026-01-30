module.exports = async (page, url) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        const boardUrl = url.split('/read/')[0];
        const referers = [boardUrl, 'https://bbs.ruliweb.com/hobby', 'https://www.google.com/'];
        await page.setExtraHTTPHeaders({
            'referer': referers[Math.floor(Math.random() * referers.length)],
            'accept-language': 'ko-KR,ko;q=0.9'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.evaluate(async () => {
            const delay = (ms) => new Promise(r => setTimeout(r, ms));
            const scrollHeight = document.body.scrollHeight;
            const steps = 4;
            for (let i = 1; i <= steps; i++) {
                window.scrollTo({
                    top: (scrollHeight / steps) * i * Math.random(),
                    behavior: 'smooth'
                });
                await delay(Math.random() * 1000 + 500);
            }
        });

        await page.mouse.move(Math.random() * 800, Math.random() * 600);

        const stayTime = 7000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("루리웹 부스팅 상세 에러:", e.message);
        return false;
    }
};
module.exports = async (page, url, log) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        if (log) log("디미토리 접속 완료");

        await page.evaluate(async () => {
            const scrollHeight = document.body.scrollHeight;
            const targetDepth = scrollHeight * (0.4 + Math.random() * 0.4); 
            window.scrollTo({ top: targetDepth, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 2000));
        });

        await page.mouse.move(100 + Math.random() * 300, 100 + Math.random() * 300);
        
        const stayTime = 6000 + Math.floor(Math.random() * 4000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (log) log(`디미토리 부스팅 실패: ${e.message}`);
        return false;
    }
};
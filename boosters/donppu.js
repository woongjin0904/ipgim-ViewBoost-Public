module.exports = async (page, url) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const boardUrl = pathParts.length > 1 
            ? `${urlObj.origin}/${pathParts[0]}` 
            : urlObj.origin;

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
        
        await page.setExtraHTTPHeaders({ 
            'referer': boardUrl,
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

        await page.evaluate(async () => {
            const header = document.querySelector('.ink_article_header') || document.querySelector('header');
            if (header) header.scrollIntoView({ behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 1000));

            const totalHeight = document.body.scrollHeight;
            const scrollPoint = Math.min(totalHeight, 800 + Math.random() * 400);
            
            window.scrollTo({
                top: scrollPoint,
                behavior: 'smooth'
            });
        });

        const x = 100 + Math.floor(Math.random() * 200);
        const y = 200 + Math.floor(Math.random() * 200);
        await page.mouse.click(x, y);

        const stayTime = 6500 + Math.floor(Math.random() * 4000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("돈뿌 부스팅 로직 실패:", e.message);
        return false;
    }
};
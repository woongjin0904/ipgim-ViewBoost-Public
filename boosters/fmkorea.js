module.exports = async (page, url) => {
    try {
        await page.setExtraHTTPHeaders({
            'referer': 'https://www.fmkorea.com/best',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const isWaiting = await page.evaluate(() => 
            document.title.includes('Just a moment') || !!document.querySelector('#cf-wrapper')
        );
        if (isWaiting) {
            console.log(`[FEMCO] 보안 확인 통과 대기 중 (약 15초)...`);
            await new Promise(r => setTimeout(r, 15000));
        }

        await page.evaluate(async () => {
            const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
            for (let i = 0; i < 4; i++) {
                const step = getRandom(300, 600);
                window.scrollBy({ top: step, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, getRandom(1500, 3000)));
            }

            window.scrollBy({ top: -200, behavior: 'smooth' });
        });

        await page.mouse.click(150 + Math.random() * 200, 250 + Math.random() * 200);

        const stayTime = 25000 + Math.floor(Math.random() * 10000); 
        console.log(`[FEMCO] 반영 대기: ${(stayTime/1000).toFixed(1)}초`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("[FEMCO Booster Error]:", e.message);
        return false;
    }
};
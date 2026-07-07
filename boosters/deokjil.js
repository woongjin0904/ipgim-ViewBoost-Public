// boosters/deokjil.js
module.exports = async (page, url, addLog) => {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1500));

        // 기본적인 유저 스크롤 모방
        await page.evaluate(async () => {
            for (let i = 0; i < 3; i++) {
                window.scrollBy(0, 300 + Math.random() * 200);
                await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
            }
        });

        const stay = 8000 + Math.random() * 4000;
        if (addLog) addLog(`[DEOKJIL] 체류 중... (${(stay / 1000).toFixed(1)}s)`);
        await new Promise(r => setTimeout(r, stay));
        
        return true;
    } catch (e) {
        if (addLog) addLog(`[DEOKJIL] 에러: ${e.message}`);
        return false;
    }
};
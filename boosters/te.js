// boosters/te31.js
module.exports = async (page, url, addLog) => {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1500));

        // 자연스러운 스크롤 액션
        await page.evaluate(async () => {
            for (let i = 0; i < 4; i++) {
                window.scrollBy(0, 300 + Math.random() * 200);
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
            }
        });

        // 10~15초 체류
        const stay = 10000 + Math.random() * 5000;
        if (addLog) addLog(`[TE31] 게시글 체류 중... (${(stay / 1000).toFixed(1)}s)`);
        await new Promise(r => setTimeout(r, stay));
        
        return true;
    } catch (e) {
        if (addLog) addLog(`[TE31] 에러: ${e.message}`);
        return false;
    }
};
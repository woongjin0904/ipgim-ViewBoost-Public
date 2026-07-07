// boosters/dasaja.js
module.exports = async (page, url, addLog) => {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // 봇 탐지를 피하기 위한 자연스러운 스크롤 액션
        await page.evaluate(async () => {
            for (let i = 0; i < 3; i++) {
                window.scrollBy(0, 300 + Math.random() * 200);
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
            }
            window.scrollBy(0, -200);
        });

        // 12~17초 체류 (자연스러운 읽기 시간)
        const stay = 12000 + Math.random() * 5000;
        if (addLog) addLog(`[DASAJA] 본문 체류 중... (${(stay / 1000).toFixed(1)}s)`);
        
        await new Promise(r => setTimeout(r, stay));
        return true;
    } catch (e) {
        if (e.message.includes('Target closed') || e.message.includes('Session closed')) {
            return false;
        }
        if (addLog) addLog(`[DASAJA] 에러: ${e.message}`);
        return false;
    }
};
module.exports = async (page, url, addLog) => {
    try {
        // 어미새 본문 진입 대기
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // 페이지가 온전히 렌더링될 수 있게 짧은 대기
        await new Promise(r => setTimeout(r, 1500));

        // 봇 방지 회피를 위한 마우스/스크롤 모방 행동
        await page.evaluate(() => {
            window.scrollBy(0, 300 + Math.random() * 200);
        });

        // 체류 시간 (2초 ~ 4초)
        const stay = 2000 + Math.random() * 2000;
        if (addLog) addLog(`[EOMISAE] 체류 중... (${(stay / 1000).toFixed(1)}s)`);
        
        await new Promise(r => setTimeout(r, stay));
        return true;
    } catch (e) {
        if (e.message.includes('Target closed') || e.message.includes('Session closed')) {
            return false;
        }
        if (addLog) addLog(`[EOMISAE] 에러: ${e.message}`);
        return false;
    }
};
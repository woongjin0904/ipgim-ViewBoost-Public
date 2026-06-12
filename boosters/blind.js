// boosters/blind.js
module.exports = async (page, url, addLog) => {
    try {
        // 블라인드 본문 진입 (네트워크 요청이 어느 정도 마무리될 때까지 대기)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // 봇 탐지 회피를 위한 마우스/스크롤 모방 행동
        await page.evaluate(async () => {
            for (let i = 0; i < 3; i++) {
                window.scrollBy(0, 300 + Math.random() * 200);
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
            }
            // 중간쯤 읽다가 위로 살짝 올리는 액션
            window.scrollBy(0, -200);
        });

        // 체류 시간 부여 (10초 ~ 15초 - 블라인드는 체류시간이 짧으면 어뷰징으로 컷팅될 확률이 높습니다)
        const stay = 10000 + Math.random() * 5000;
        if (addLog) addLog(`[BLIND] 본문 체류 중... (${(stay / 1000).toFixed(1)}s)`);
        
        await new Promise(r => setTimeout(r, stay));
        return true;
    } catch (e) {
        if (e.message.includes('Target closed') || e.message.includes('Session closed')) {
            return false;
        }
        if (addLog) addLog(`[BLIND] 에러: ${e.message}`);
        return false;
    }
};
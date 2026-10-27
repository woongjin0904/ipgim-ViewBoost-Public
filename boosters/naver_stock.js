module.exports = async (page, url, addLog) => {
    try {
        // 네트워크 상태가 domcontentloaded될 때까지 대기하여 초기 렌더링 확보
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // 실제 사용자처럼 화면을 천천히 내렸다 올리는 행위 모방
        await page.evaluate(async () => {
            for (let i = 0; i < 3; i++) {
                window.scrollBy(0, 300 + Math.random() * 200);
                await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
            }
            window.scrollBy(0, -200); // 다시 살짝 올리기
        });

        // 네이버 증권은 내부적으로 조회수 카운팅을 위해 최소한의 렌더링 체류시간을 요구하므로 여유있게 대기
        const stay = 8000 + Math.random() * 4000;
        if (addLog) addLog(`[NAVER_STOCK] 본문 체류 및 통신 대기 중... (${(stay / 1000).toFixed(1)}s)`);
        await new Promise(r => setTimeout(r, stay));
        
        return true;
    } catch (e) {
        if (addLog) addLog(`[NAVER_STOCK] 페이지 진입 에러: ${e.message}`);
        return false;
    }
};
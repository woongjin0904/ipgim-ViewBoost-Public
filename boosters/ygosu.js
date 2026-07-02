module.exports = async (page, url, addLog) => {
    try {
        // 1. 페이지 접속
        // 와이고수는 기본적으로 빠르지만 광고와 이미지 로딩이 있으므로 domcontentloaded를 기준으로 1차 대기합니다.
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // 2. 기본 렌더링 및 안정화 대기
        await new Promise(r => setTimeout(r, 2000));

        // 3. 본문 컨테이너 렌더링 확인 (와이고수의 본문 래퍼 클래스)
        await page.waitForSelector('.board_body', { timeout: 15000 }).catch(() => {});

        // 4. 인간다운 상호작용 (랜덤 스크롤)
        // 체류 시간 동안 스크롤을 내려 lazy-load 되는 이미지나 광고를 노출시킵니다.
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3); // 3~5회 반복
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 300 + Math.random() * 300, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
            }
        });

        // 5. 조회수 집계를 위한 충분한 체류 시간 유지 (약 8초 ~ 15초 랜덤)
        const stayTime = 8000 + Math.floor(Math.random() * 7000);
        if (addLog) addLog(`[YGOSU] 조회수 반영 대기 중... (${(stayTime / 1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (addLog) addLog(`[YGOSU] 부스팅 중 에러 발생: ${e.message}`);
        console.error("YGOSU 부스터 모듈 에러:", e.message);
        return false;
    }
};
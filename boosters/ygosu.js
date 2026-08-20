module.exports = async (page, url, addLog) => {
    try {
        // 1. 봇 탐지 우회를 위한 헤더 및 Referer 조작
        // 게시판 목록에서 클릭해서 들어온 것처럼 위장합니다.
        await page.setExtraHTTPHeaders({
            'Referer': 'https://ygosu.com/board/?m2=board',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        // 2. 메인 페이지 선행 방문 (세션 쿠키 발급 및 유입 경로 세탁)
        if (addLog) addLog(`[YGOSU] 쉴드 우회를 위해 메인 페이지 우선 경유...`);
        await page.goto('https://ygosu.com/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

        // 3. 타겟 게시글 페이지 접속
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // 4. 기본 렌더링 및 안정화 대기
        await new Promise(r => setTimeout(r, 2000));

        // 5. 본문 컨테이너 렌더링 확인 (와이고수의 본문 래퍼 클래스)
        // 만약 클라우드플레어 JS 챌린지 페이지라면 여기서 잠시 대기하게 됩니다.
        await page.waitForSelector('.board_body', { timeout: 15000 }).catch(() => {
            if (addLog) addLog(`[YGOSU] 본문 탐지 실패 (클라우드플레어 또는 지연). 스크롤을 강행합니다.`);
        });

        // 6. 인간다운 상호작용 (랜덤 스크롤)
        // 체류 시간 동안 스크롤을 내려 lazy-load 되는 이미지나 광고를 노출시킵니다.
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3); // 3~5회 반복
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 300 + Math.random() * 300, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
            }
        });

        // 7. 조회수 집계를 위한 충분한 체류 시간 유지 (약 8초 ~ 15초 랜덤)
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
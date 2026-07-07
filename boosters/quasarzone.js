module.exports = async (page, url, addLog) => {
    try {
        // 1. 페이지 로드 시 네트워크 아이들 상태까지 명시적 대기
        addLog(`[QUASARZONE] 접속 시도: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // 2. 퀘이사존 게시글 상세 영역 선택자 최적화 
        // '.view-wrap' 또는 '.view-content' 중 하나가 나타날 때까지 대기
        await page.waitForSelector('.view-wrap, .view-content', { timeout: 20000 });

        // 3. 페이지 안정화 대기 (스크립트 및 레이아웃 렌더링 시간 확보)
        await new Promise(r => setTimeout(r, 2000));

        // 4. 인간적인 스크롤 및 체류 동작
        await page.evaluate(async () => {
            const scrollHeight = document.body.scrollHeight;
            
            // 첫 번째 스크롤
            window.scrollBy(0, 400 + Math.random() * 200);
            await new Promise(r => setTimeout(r, 1500));
            
            // 두 번째 스크롤 (중간 지점)
            window.scrollTo(0, scrollHeight / 2);
            await new Promise(r => setTimeout(r, 1000));
        });

        // 5. 충분한 체류 시간 확보
        const stayTime = 10000 + Math.floor(Math.random() * 5000);
        addLog(`[QUASARZONE] ${stayTime/1000}초간 체류하며 조회수 확보 중...`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("퀘이사존 부스터 상세 에러:", e.message);
        return false;
    }
};
module.exports = async (page, url, addLog) => {
    try {
        // 불펜(게시판 목록)을 리퍼러로 설정하여 자연스러운 유입으로 위장
        await page.setExtraHTTPHeaders({ 'referer': 'https://mlbpark.donga.com/mp/b.php?b=bullpen' });

        // 네트워크 안정화 대기
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 });
        
        // 제목 렌더링 확인 (로딩 확인용)
        await page.waitForSelector('.titles', { timeout: 15000 }).catch(() => {});

        // 사람과 유사한 자연스러운 본문 스크롤 모방
        await page.evaluate(async () => {
            window.scrollBy({ top: 400 + Math.random() * 300, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
            window.scrollBy({ top: 300 + Math.random() * 400, behavior: 'smooth' });
        });
        
        // 무작위 영역 클릭 (광고나 링크를 피하기 위해 빈 공간 기준)
        await page.mouse.click(200 + Math.random() * 200, 300 + Math.random() * 200);

        // 체류 시간 (엠엘비파크 특성을 고려해 8~14초 체류)
        const stayTime = 8000 + Math.floor(Math.random() * 6000);
        if(typeof addLog === 'function') addLog(`[MLBPARK] 게시글 체류 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("[MLBPARK Module Error]:", e.message);
        return false;
    }
};
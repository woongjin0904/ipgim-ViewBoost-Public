module.exports = async (page, url, addLog) => {
    try {
        // [핵심 우회 1] 타겟 URL로 바로 가지 않고, 불펜 목록 페이지를 먼저 진짜로 접속합니다.
        // 이를 통해 엠엘비파크 서버로부터 유효한 세션 쿠키를 발급받습니다.
        if(typeof addLog === 'function') addLog(`[MLBPARK] 세션 발급을 위해 목록 페이지 우회 접속 중...`);
        await page.goto('https://mlbpark.donga.com/mp/b.php?b=bullpen', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // 목록 페이지에서 인간처럼 잠시 대기 (2~3초)
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500));

        // [핵심 우회 2] 세션을 획득한 상태에서, 헤더를 세팅하고 실제 타겟 게시글로 이동
        await page.setExtraHTTPHeaders({ 'referer': 'https://mlbpark.donga.com/mp/b.php?b=bullpen' });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 });
        
        // 제목이나 본문이 로드될 때까지 대기
        await page.waitForSelector('.titles, .ar_txt', { timeout: 15000 }).catch(() => {});

        // 인간과 유사한 마우스 무빙 및 스크롤
        await page.mouse.move(100 + Math.random() * 300, 200 + Math.random() * 300);
        await page.evaluate(async () => {
            window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 1500));
            window.scrollBy({ top: 200 + Math.random() * 300, behavior: 'smooth' });
        });

        // 체류 시간 (10~15초)
        const stayTime = 10000 + Math.floor(Math.random() * 5000);
        if(typeof addLog === 'function') addLog(`[MLBPARK] 반영 대기 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("[MLBPARK Module Error]:", e.message);
        return false;
    }
};
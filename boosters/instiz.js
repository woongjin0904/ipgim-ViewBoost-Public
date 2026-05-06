module.exports = async (page, url, log) => {
    // ⚙️ 모바일 접속 여부 확인 (보배드림 모바일 주소 기준)
    const isM = url.includes('m.bobaedream');

    try {
        if (log) log(`[BOBAEDREAM] 봇 탐지 우회 기법 적용 및 페이지 로딩 시작...`);

        // 🛡️ [우회 기법 1] 쿠키 및 캐시 삭제 (완전한 새 방문자로 위장)
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        // 🛡️ [우회 기법 2] PC/모바일에 맞는 자연스러운 기기 정보(User-Agent) 적용
        await page.setUserAgent(isM 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' 
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // 🛡️ [우회 기법 3] 기기에 맞는 화면 크기 및 모바일 터치 환경 모방
        await page.setViewport(isM 
            ? { width: 375, height: 812, isMobile: true, hasTouch: true } 
            : { width: 1440, height: 900 });

        // 🛡️ [우회 기법 4] 이전 페이지 출처(Referer) 설정
        const referer = isM ? 'https://m.bobaedream.co.kr/' : 'https://www.bobaedream.co.kr/';
        await page.setExtraHTTPHeaders({ 
            'referer': referer,
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        });

        // 🚀 우회 설정 완료 후 페이지 접속
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        if (log) log(`[BOBAEDREAM] 본문 진입 완료. 빠른 스크롤 로직 시작...`);


        // --- 아래부터는 기존에 최적화했던 빠른 스크롤 및 클릭 로직입니다 ---

        const SCROLL_MIN_STEPS = 3;
        const SCROLL_MAX_STEPS = 5;
        const SCROLL_MIN_DELAY = 500;
        const SCROLL_MAX_DELAY = 1200;
        
        const STAY_MIN_TIME = 5000;
        const STAY_MAX_TIME = 8000;

        await page.evaluate(async (minSteps, maxSteps, minDelay, maxDelay) => {
            const steps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1)); 
            
            for (let i = 0; i < steps; i++) {
                window.scrollBy({ top: 300 + Math.random() * 400, behavior: 'smooth' });
                const delay = minDelay + Math.random() * (maxDelay - minDelay);
                await new Promise(r => setTimeout(r, delay));
            }
            
            window.scrollBy({ top: -(200 + Math.random() * 200), behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 800));
        }, SCROLL_MIN_STEPS, SCROLL_MAX_STEPS, SCROLL_MIN_DELAY, SCROLL_MAX_DELAY);

        const randomX = 200 + Math.random() * 300;
        const randomY = 300 + Math.random() * 400;
        await page.mouse.move(randomX, randomY, { steps: 5 }); 
        await page.mouse.click(randomX, randomY);

        const stayTime = STAY_MIN_TIME + Math.floor(Math.random() * (STAY_MAX_TIME - STAY_MIN_TIME)); 
        if (log) log(`[BOBAEDREAM] 서버 검증 통과 대기 중... (${(stayTime / 1000).toFixed(1)}초)`);
        
        await new Promise(r => setTimeout(r, stayTime));

        if (log) log(`[BOBAEDREAM] 체류 완료 및 조회수 반영 성공 예상`);
        return true;

    } catch (e) {
        if (log) log(`[BOBAEDREAM 에러] 부스팅 진행 중 문제 발생: ${e.message}`);
        return false;
    }
};
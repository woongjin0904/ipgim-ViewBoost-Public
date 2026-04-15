module.exports = async (page, url, log) => {
    try {
        // 1. 초기화
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        // 2. 모바일 환경으로 완벽 위장 (네이트판은 모바일 트래픽이 우회에 유리함)
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');
        await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

        // URL 파싱 (예: https://pann.nate.com/talk/372... -> https://pann.nate.com/talk)
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.origin}`;
        const boardUrl = `${baseUrl}/talk`; // 네이트판 톡 메인

        // 3. 우회 1단계: 게시판 목록 페이지 선 접속 (쿠키 발급 및 자연스러운 흐름 생성)
        if (log) log(`[NATEPANN] 세션 획득을 위해 톡 메인 페이지 우회 접속 중...`);
        await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // 페이지 로드 후 잠시 대기 (사람처럼)
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

        // 4. 우회 2단계: 헤더에 Referer 삽입 후 실제 게시글 진입
        if (log) log(`[NATEPANN] 정상 트래픽으로 위장하여 타겟 게시물 진입`);
        await page.setExtraHTTPHeaders({
            'referer': boardUrl, // 직전에 목록 페이지에 있었다는 증명
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

        // 5. 우회 3단계: 조회수 API 트리거를 위한 인간 모방 스크롤 및 클릭
        await page.evaluate(async () => {
            const scrollSteps = 4 + Math.floor(Math.random() * 3);
            for (let i = 0; i < scrollSteps; i++) {
                // 모바일 환경에 맞는 부드러운 스크롤
                window.scrollBy({ top: 300 + Math.random() * 250, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
            }
        });

        // 본문 영역 무작위 터치(클릭) 이벤트 발생
        await page.mouse.click(200 + Math.random() * 100, 400 + Math.random() * 200);

        // 6. 충분한 체류 시간 확보 (조회수 서버 반영 대기)
        // 네이트판은 체류 시간이 10~15초 이상 요구될 수 있습니다.
        const stayTime = 18000 + Math.floor(Math.random() * 8000); 
        if (log) log(`[NATEPANN] 서버 데이터 반영 대기 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (log) log(`[NATEPANN 에러] ${e.message}`);
        return false;
    }
};
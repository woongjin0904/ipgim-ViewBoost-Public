module.exports = async (page, url) => {
    const isM = url.includes('m.ppomppu.co.kr');

    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.setUserAgent(isM 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' 
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.setViewport(isM 
            ? { width: 390, height: 844, isMobile: true, hasTouch: true } 
            : { width: 1440, height: 900 });

        // 🛡️ [핵심 추가 우회 로직] 브라우저 내부 지문(Fingerprint) 위장
        // 페이지의 HTML이 로드되기 전에 먼저 실행되어 봇 탐지 센서를 무력화합니다.
        await page.evaluateOnNewDocument(() => {
            // 1. "나는 로봇(Webdriver)이 아닙니다" 라고 브라우저 속성 덮어쓰기
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            
            // 2. 가상의 크롬 객체 생성 (일반 크롬 브라우저처럼 보이게 함)
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {}
            };

            // 3. 플러그인 개수 속이기 (봇 브라우저는 보통 플러그인이 0개임)
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
            Object.defineProperty(navigator, 'languages', { get: () => ['ko-KR', 'ko', 'en-US', 'en'] });
        });

        const boardId = url.split('id=')[1]?.split('&')[0];
        let referer = isM ? 'https://m.ppomppu.co.kr/' : 'https://www.ppomppu.co.kr/';
        if (boardId) {
            referer += isM ? `zboard.php?id=${boardId}` : `zboard/zboard.php?id=${boardId}`;
        }

        await page.setExtraHTTPHeaders({ 
            'referer': referer,
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

        await page.evaluate(async () => {
            const scrollHeight = document.body.scrollHeight;
            const targetDepth = scrollHeight * (0.5 + Math.random() * 0.3); 
            const step = 200;
            
            for (let i = 0; i < targetDepth; i += step) {
                window.scrollBy({ top: step, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 200 + Math.random() * 150));
            }
        });

        await page.mouse.click(150 + Math.random() * 100, 200 + Math.random() * 100);

        const stayTime = 5000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("뽐뿌 부스팅 에러:", e.message);
        return false;
    }
};
module.exports = async (page, url, log) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        // PC 환경으로 세팅 (네이트판은 PC웹에서의 검색 우회가 더 안정적일 수 있습니다)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        // URL 분석 (글 번호 추출)
        // 예: https://pann.nate.com/talk/372000000 -> 372000000
        const urlParts = url.split('/');
        const articleId = urlParts[urlParts.length - 1].split('?')[0]; 
        const boardUrl = urlParts.slice(0, -1).join('/'); // https://pann.nate.com/talk

        if (log) log(`[NATEPANN] 게시판 목록 페이지 직접 접속 시도...`);
        await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500));

        // 우회 핵심: DOM에서 실제 링크를 찾아서 클릭 (Goto 절대 사용 금지)
        const linkSelector = `a[href*="${articleId}"]`;
        let linkHandle = await page.$(linkSelector);

        if (linkHandle) {
            if (log) log(`[NATEPANN] 목록에서 타겟 게시물 발견. 직접 클릭하여 진입합니다.`);
            // 요소가 화면에 보이도록 스크롤
            await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, linkSelector);
            await new Promise(r => setTimeout(r, 1500));
            
            // 실제 DOM 클릭과 동시에 네비게이션 대기
            await Promise.all([
                page.click(linkSelector),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 40000 })
            ]);
        } else {
            // 목록 페이지(1페이지)에 글이 넘어갔을 경우를 대비한 2차 우회 (검색 페이지 활용)
            if (log) log(`[NATEPANN] 목록에 글이 없어 검색 시스템 우회를 시도합니다.`);
            const searchUrl = `https://pann.nate.com/search/pann?q=${articleId}`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2000));

            linkHandle = await page.$(linkSelector);
            if (linkHandle) {
                if (log) log(`[NATEPANN] 검색 결과에서 글 발견. 클릭하여 진입합니다.`);
                await Promise.all([
                    page.click(linkSelector),
                    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 40000 })
                ]);
            } else {
                // 최후의 수단: 검색 페이지를 Referer로 삼아 Goto 실행
                if (log) log(`[NATEPANN] 검색 결과에도 없어 강제 이동합니다. (성공률 저하 우려)`);
                await page.setExtraHTTPHeaders({ 'referer': searchUrl });
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
            }
        }

        // 사람임을 증명하는 페이지 체류 및 행동 패턴
        await page.evaluate(async () => {
            const steps = 4 + Math.floor(Math.random() * 3);
            for(let i = 0; i < steps; i++) {
                window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
            }
            // 마지막엔 위로 살짝 올리는 행동 추가
            window.scrollBy({ top: -200, behavior: 'smooth' });
        });

        // 의미 없는 빈 공간 마우스 클릭 (봇 판별 회피용)
        await page.mouse.move(200 + Math.random() * 400, 300 + Math.random() * 300);
        await page.mouse.click(200 + Math.random() * 400, 300 + Math.random() * 300);

        // 네이트판은 체류 시간에 매우 민감함 (최소 20초 이상 권장)
        const stayTime = 22000 + Math.floor(Math.random() * 10000);
        if (log) log(`[NATEPANN] 서버 검증 통과 및 반영 대기 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (log) log(`[NATEPANN 에러] ${e.message}`);
        return false;
    }
};
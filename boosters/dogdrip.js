module.exports = async (page, url, addLog) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        await page.setExtraHTTPHeaders({ 
            'referer': 'https://www.dogdrip.net/',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        // 1. 게시글 접속
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // 2. [강화] 실제 읽기 시뮬레이션 (본문 하단까지 스크롤)
        await page.evaluate(async () => {
            const distance = 200;
            const delay = 150;
            // 문서 끝까지 천천히 내려감 (조회수 트리거 유도)
            while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
                window.scrollBy(0, distance);
                await new Promise(r => setTimeout(r, delay));
                if (Math.random() > 0.9) await new Promise(r => setTimeout(r, 1000)); // 중간 멈춤
            }
        });

        // 3. 본문 영역 랜덤 클릭 (활성 사용자 신호)
        await page.mouse.click(300, 400);

        // 4. [중요] 체류 시간 대폭 연장 (최소 15초 이상 권장)
        const stayTime = 15000 + Math.floor(Math.random() * 5000);
        addLog(`[DOGDRIP] 데이터 반영 대기 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("개드립 부스팅 에러:", e.message);
        return false;
    }
};
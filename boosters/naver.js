// boosters/naver.js (GitHub용 고도화 버전)
module.exports = async (page, url, addLog) => {
    try {
        // 1. 네이버 메인이 아닌 '네이버 통합검색' 혹은 '카페 메인'을 Referer로 설정
        const searchReferer = `https://search.naver.com/search.naver?query=${encodeURIComponent('네이버 카페')}`;
        await page.setExtraHTTPHeaders({
            'Referer': searchReferer,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        });

        // 2. 접속 전 쿠키 및 캐시 완전 초기화 (GitHub Actions 환경 특이성 대응)
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');

        // 3. 페이지 접속 (networkidle2는 데이터센터에서 오래 걸리므로 가급적 지양)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        
        const frameHandle = await page.waitForSelector('#cafe_main', { timeout: 15000 });
        const frame = await frameHandle.contentFrame();

        if (frame) {
            // [핵심] 실제 유저처럼 보이기 위해 특정 섹션으로 마우스 이동 후 클릭 시뮬레이션
            await frame.waitForSelector('.article_viewer', { timeout: 10000 }).catch(() => {});
            
            // 랜덤 스크롤 (조회수 인정의 필수 조건)
            await frame.evaluate(async () => {
                const distance = 300 + Math.floor(Math.random() * 500);
                window.scrollBy(0, distance);
            });

            // 4. 무작위 체류 시간 (조회수 서버 반영 시간 확보)
            // 데이터센터 IP는 더 긴 체류 시간이 필요함
            const stayTime = 25000 + Math.floor(Math.random() * 15000); 
            if(addLog) addLog(`[NAVER] 데이터센터 우회 체류 중... (${(stayTime/1000).toFixed(1)}초)`);
            await new Promise(r => setTimeout(r, stayTime));
        }
        return true;
    } catch (e) {
        if(addLog) addLog(`[NAVER 에러] ${e.message}`);
        return false;
    }
};
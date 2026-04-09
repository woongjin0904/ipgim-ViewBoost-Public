module.exports = async (page, url, addLog) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        // 스레딕 도메인 추출 (Referer용)
        const urlObj = new URL(url);
        const boardUrl = urlObj.origin;

        await page.setExtraHTTPHeaders({ 
            'referer': boardUrl,
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        // 페이지 이동
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

        // 스크롤 및 체류 로직
        await page.evaluate(async () => {
            // 본문 영역으로 부드럽게 스크롤
            const thread = document.querySelector('.thread_res');
            if (thread) thread.scrollIntoView({ behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 1000));
            
            // 약간 아래로 더 스크롤하여 자연스러운 읽기 동작 흉내
            const totalHeight = document.body.scrollHeight;
            const scrollPoint = Math.min(totalHeight, 500 + Math.random() * 300);
            
            window.scrollTo({ top: scrollPoint, behavior: 'smooth' });
        });

        // 임의의 위치 마우스 클릭
        const x = 100 + Math.floor(Math.random() * 200);
        const y = 200 + Math.floor(Math.random() * 200);
        await page.mouse.click(x, y);

        // 체류 시간 (약 6.5초 ~ 10.5초)
        const stayTime = 6500 + Math.floor(Math.random() * 4000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (addLog) addLog(`[THREDIC] 스레딕 부스팅 로직 실패: ${e.message}`);
        console.error("스레딕 부스팅 로직 실패:", e.message);
        return false;
    }
};
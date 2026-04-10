module.exports = async (page, url) => {
    try {
        // 이토랜드 기본 리퍼러 우회
        await page.setExtraHTTPHeaders({ 'referer': 'https://www.etoland.co.kr/' });

        // 네트워크 안정화까지 대기
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 });
        
        // 페이지 로드 후 본문 컨테이너 대기 (필요시 선택자 수정)
        await page.waitForSelector('.board_view_title, .title_subject', { timeout: 15000 }).catch(() => {});

        // 사람과 유사한 스크롤 및 마우스 움직임 모방
        await page.evaluate(async () => {
            window.scrollBy({ top: 300 + Math.random() * 400, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 2000));
            window.scrollBy({ top: 200 + Math.random() * 200, behavior: 'smooth' });
        });
        
        await page.mouse.click(150 + Math.random() * 150, 250 + Math.random() * 150);

        // 체류 시간 (7~11초)
        const stayTime = 7000 + Math.floor(Math.random() * 4000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("[ETOLAND Module Error]:", e.message);
        return false;
    }
};
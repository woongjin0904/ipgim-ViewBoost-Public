/**
 * 디시인사이드(DCINSIDE) 부스팅 모듈
 */
module.exports = async (page, url) => {
    try {
        // 1. 갤러리 유형에 따른 리퍼러 설정
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const galleryId = urlParams.get('id');
        let referer = 'https://www.dcinside.com/';
        
        if (galleryId) {
            const gallType = url.includes('mgallery') ? 'mgallery/' : (url.includes('mini') ? 'mini/' : '');
            referer = `https://gall.dcinside.com/${gallType}board/lists/?id=${galleryId}`;
        }
        
        await page.setExtraHTTPHeaders({ 'referer': referer });

        // 2. 게시글 접속 및 네트워크 안정화 대기
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 });
        
        // 3. 핵심 요소 렌더링 확인 (안착 대기)
        await page.waitForFunction(() => !!document.querySelector('.title_subject'), { timeout: 15000 }).catch(() => {});

        // 4. 스크롤 및 클릭 시뮬레이션
        await page.evaluate(async () => {
            window.scrollBy({ top: 500 + Math.random() * 300, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 2000));
        });
        await page.mouse.click(150 + Math.random() * 100, 200 + Math.random() * 100);

        const stayTime = 6000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("[DCINSIDE Module Error]:", e.message);
        return false;
    }
};
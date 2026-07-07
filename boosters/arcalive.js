module.exports = async (page, url) => {
    try {
        // ✅ 1. 페이지 이동 로직 복구 (메인 서버에서 넘겨주지 않으므로 필수)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // 페이지 로드 후 약간의 안정화 대기
        await new Promise(r => setTimeout(r, 2000));

        // ✅ 2. 아카라이브 본문 요소 렌더링 대기
        // (네트워크 아이들 상태라도 CSR 렌더링이 늦을 수 있으므로 대기)
        await page.waitForSelector('.article-wrapper', { timeout: 15000 }).catch(() => {});

        // ✅ 3. 인간다운 상호작용 (스크롤)
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
        });

        // ✅ 4. 충분한 체류 시간 유지
        const stayTime = 7000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("아카라이브 로컬 부스터 모듈 에러:", e.message);
        return false;
    }
};
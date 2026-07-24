module.exports = async (page, url, addLog) => {
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

        // SLRClub 본문 렌더링 대기
        await page.waitForSelector('#userct', { timeout: 15000 }).catch(() => {});

        // 인간다운 상호작용 (스크롤)
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
        });

        // 체류 시간 유지
        const stayTime = 6000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (addLog) addLog(`[SLRCLUB 에러]: ${e.message}`);
        return false;
    }
};
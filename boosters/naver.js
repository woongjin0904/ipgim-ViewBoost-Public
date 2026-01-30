module.exports = async (page, url, addLog) => {
    try {
        // [보강] Referer 생성을 위해 네이버 메인을 먼저 방문
        await page.goto('https://www.naver.com', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

        // 실제 카페 게시글 이동
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const frameHandle = await page.waitForSelector('#cafe_main', { timeout: 15000 });
        const frame = await frameHandle.contentFrame();

        if (frame) {
            await frame.waitForSelector('.se-main-container, .ContentRenderer', { timeout: 10000 }).catch(() => {});

            // [보강] 실제 사람처럼 조금씩 끊어서 스크롤 (조회수 인정 확률 대폭 상승)
            await frame.evaluate(async () => {
                const distance = 100;
                const delay = 200;
                while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
                    window.scrollBy(0, distance);
                    await new Promise(r => setTimeout(r, delay));
                    if (document.scrollingElement.scrollTop > 2000) break; // 너무 길면 중단
                }
            });

            await page.mouse.click(400, 400);

            // [보강] 체류 시간 최소 15초 이상 확보
            const stayTime = 15000 + Math.floor(Math.random() * 10000);
            await new Promise(r => setTimeout(r, stayTime));
        }

        return true;
    } catch (e) {
        if(addLog) addLog(`[NAVER 에러] ${e.message}`);
        return false;
    }
};
module.exports = async (page, url, addLog) => {
    try {
        // Referer 구성을 위해 네이버 메인을 거쳐 이동
        await page.goto('https://www.naver.com', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1500));

        // 실제 목표 URL 이동
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const frameHandle = await page.waitForSelector('#cafe_main', { timeout: 15000 });
        const frame = await frameHandle.contentFrame();

        if (frame) {
            // 게시글 내용이 로드될 때까지 대기
            await frame.waitForSelector('.se-main-container, .ContentRenderer', { timeout: 15000 });

            // 1. 사람처럼 부드러운 스크롤
            await frame.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 100;
                    let timer = setInterval(() => {
                        let scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if(totalHeight >= scrollHeight || totalHeight > 3000){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 200 + Math.random() * 100);
                });
            });

            // 2. 의미 없는 클릭 방지 (가끔 본문 빈 영역 클릭)
            await page.mouse.click(
                200 + Math.floor(Math.random() * 100), 
                300 + Math.floor(Math.random() * 100)
            );

            // 3. 체류 시간 확보 (매우 중요: 최소 15~25초)
            const stayTime = 15000 + Math.random() * 10000;
            await new Promise(r => setTimeout(r, stayTime));
            
            return true;
        }
        return false;
    } catch (e) {
        if(addLog) addLog(`[NAVER 에러] ${e.message}`);
        return false;
    }
};
module.exports = async (page, url, addLog) => {
    try {
        await page.goto('https://www.naver.com', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const frameHandle = await page.waitForSelector('#cafe_main', { timeout: 15000 });
        const frame = await frameHandle.contentFrame();

        if (frame) {
            await frame.waitForSelector('.se-main-container, .ContentRenderer', { timeout: 10000 }).catch(() => {});

            await frame.evaluate(async () => {
                const distance = 100;
                const delay = 200;
                while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
                    window.scrollBy(0, distance);
                    await new Promise(r => setTimeout(r, delay));
                    if (document.scrollingElement.scrollTop > 2000) break;
                }
            });

            await page.mouse.click(400, 400);

            const stayTime = 15000 + Math.floor(Math.random() * 10000);
            await new Promise(r => setTimeout(r, stayTime));
        }

        return true;
    } catch (e) {
        if(addLog) addLog(`[NAVER 에러] ${e.message}`);
        return false;
    }
};
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
                const totalHeight = document.body.scrollHeight;
                for (let i = 0; i < 3; i++) {
                    window.scrollBy(0, totalHeight / 3);
                    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
                }
            });

            await page.mouse.click(400, 400);

            const stayTime = 12000 + Math.floor(Math.random() * 8000);
            await new Promise(r => setTimeout(r, stayTime));
        }

        return true;
    } catch (e) {
        if(addLog) addLog(`[NAVER 에러] ${e.message}`);
        return false;
    }
};
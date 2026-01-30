module.exports = async (page, url) => {
    try {
        await page.waitForSelector('.view-content', { timeout: 15000 }).catch(() => {});

        await page.evaluate(async () => {
            window.scrollBy(0, 400 + Math.random() * 200);
            await new Promise(r => setTimeout(r, 1000));
        });

        const stayTime = 7000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("퀘이사존 부스터 상세 에러:", e.message);
        return false;
    }
};
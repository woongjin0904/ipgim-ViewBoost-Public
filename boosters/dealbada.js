// boosters/dealbada.js
module.exports = async (page, url, addLog) => {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1500));

        await page.evaluate(async () => {
            for (let i = 0; i < 3; i++) {
                window.scrollBy(0, 300 + Math.random() * 200);
                await new Promise(r => setTimeout(r, 1000));
            }
        });

        const stay = 12000 + Math.random() * 5000;
        if (addLog) addLog(`[DEALBADA] 체류 중... (${(stay / 1000).toFixed(1)}s)`);
        await new Promise(r => setTimeout(r, stay));
        return true;
    } catch (e) {
        return false;
    }
};
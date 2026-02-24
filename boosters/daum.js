module.exports = async (page, url, addLog) => {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

        const frame = await page.waitForFrame(
            f => f.name() === 'down' || f.url().includes('_c21_/bbs_read'),
            { timeout: 5000 }
        ).catch(() => null);

        if (frame && !page.isClosed()) {
            await new Promise(r => setTimeout(r, 500));

            await frame.evaluate(() => {
                window.scrollBy(0, 150);
                const body = document.body;
                if (body) body.click();
            }).catch(() => {});

            const stay = 1800 + Math.random() * 1000;
            if (addLog) addLog(`[DAUM-FAST] 트리거 완료 (${(stay/1000).toFixed(1)}s)`);
            
            await new Promise(r => setTimeout(r, stay));
            return true;
        }
        return false;
    } catch (e) {
        if (e.message.includes('Target closed') || e.message.includes('Session closed')) {
            return false; 
        }
        return false;
    }
};
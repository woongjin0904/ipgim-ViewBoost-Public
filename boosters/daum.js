/**
 * 다음 카페 초고속 부스팅 모듈 (안정화 버전)
 */
module.exports = async (page, url, addLog) => {
    try {
        // 1. 타임아웃을 넉넉히 주되, 로드 즉시 진행
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

        // 2. 프레임이 나타날 때까지 명시적 대기 (find 대신 waitForFrame 권장)
        const frame = await page.waitForFrame(
            f => f.name() === 'down' || f.url().includes('_c21_/bbs_read'),
            { timeout: 5000 }
        ).catch(() => null);

        if (frame && !page.isClosed()) {
            // 3. 트리거 전 잠시 대기 (브라우저 컨텍스트 안정화)
            await new Promise(r => setTimeout(r, 500));

            // 4. 카운팅 트리거
            await frame.evaluate(() => {
                window.scrollBy(0, 150);
                // 강제 클릭 이벤트 시뮬레이션 (조회수 반영 확률 상승)
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
        // Protocol error 방지: 페이지가 이미 닫혔는지 확인
        if (e.message.includes('Target closed') || e.message.includes('Session closed')) {
            return false; 
        }
        return false;
    }
};
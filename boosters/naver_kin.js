module.exports = async (page, url, addLog) => {
    try {
        // 지식iN 본문 진입 및 대기 (모바일 뷰나 PC 뷰 모두 호환 가능)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // 지식iN 특성상 본문 렌더링이 약간의 비동기를 거칠 수 있으므로 2초 여유 대기
        await new Promise(r => setTimeout(r, 2000));

        // 봇 방지 회피를 위한 스크롤 (질문글 확인 및 답변글 스크롤 모방)
        await page.evaluate(async () => {
            window.scrollBy(0, 300 + Math.random() * 200);
            await new Promise(r => setTimeout(r, 1000));
            window.scrollBy(0, 400 + Math.random() * 200);
        });

        // 지식iN 조회수 반영 체류 시간 부여 (4초 ~ 6초)
        const stay = 4000 + Math.random() * 2000;
        if (addLog) addLog(`[NAVER_KIN] 지식iN 본문 체류 중... (${(stay / 1000).toFixed(1)}s)`);
        
        await new Promise(r => setTimeout(r, stay));
        return true;
    } catch (e) {
        if (e.message.includes('Target closed') || e.message.includes('Session closed')) {
            return false;
        }
        if (addLog) addLog(`[NAVER_KIN] 에러: ${e.message}`);
        return false;
    }
};
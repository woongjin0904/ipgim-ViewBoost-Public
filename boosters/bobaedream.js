
module.exports = async (page, url, log) => {
    try {
        if (log) log(`[BOBAEDREAM] 본문 진입 완료. 빠른 사람 모방 스크롤 및 체류 로직 시작...`);

        // ⚙️ [속도 조절 변수 설정] 
        // 여기서 원하는 속도에 맞춰 숫자만 쉽게 변경하세요! (단위: ms)
        const SCROLL_MIN_STEPS = 3;    // 스크롤 횟수 최소 (기존: 약 5)
        const SCROLL_MAX_STEPS = 5;    // 스크롤 횟수 최대 (기존: 약 8)
        const SCROLL_MIN_DELAY = 500;  // 스크롤 사이 최소 대기 0.5초 (기존: 1초)
        const SCROLL_MAX_DELAY = 1200; // 스크롤 사이 최대 대기 1.2초 (기존: 3초)
        
        const STAY_MIN_TIME = 5000;    // 최종 체류 최소 5초 (기존: 18초)
        const STAY_MAX_TIME = 8000;    // 최종 체류 최대 8초 (기존: 25초)

        // 브라우저 내부(evaluate)로 변수를 전달하여 실행합니다.
        await page.evaluate(async (minSteps, maxSteps, minDelay, maxDelay) => {
            // 스크롤 횟수 랜덤 지정
            const steps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1)); 
            
            for (let i = 0; i < steps; i++) {
                window.scrollBy({ top: 300 + Math.random() * 400, behavior: 'smooth' });
                
                // 짧고 자연스러운 스크롤 대기 시간
                const delay = minDelay + Math.random() * (maxDelay - minDelay);
                await new Promise(r => setTimeout(r, delay));
            }
            
            // 마지막에 살짝 위로 올리는 페이크 모션 (딜레이 1.5초 -> 0.8초 단축)
            window.scrollBy({ top: -(200 + Math.random() * 200), behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 800));
        }, SCROLL_MIN_STEPS, SCROLL_MAX_STEPS, SCROLL_MIN_DELAY, SCROLL_MAX_DELAY);

        // 마우스 움직임 및 클릭 (steps 10 -> 5로 줄여 마우스 이동 속도 향상)
        const randomX = 200 + Math.random() * 300;
        const randomY = 300 + Math.random() * 400;
        await page.mouse.move(randomX, randomY, { steps: 5 }); 
        await page.mouse.click(randomX, randomY);

        // 최종 대기 시간 (최대 25초에서 -> 평균 6초 수준으로 대폭 단축)
        const stayTime = STAY_MIN_TIME + Math.floor(Math.random() * (STAY_MAX_TIME - STAY_MIN_TIME)); 
        if (log) log(`[BOBAEDREAM] 서버 검증 통과 대기 중... (${(stayTime / 1000).toFixed(1)}초)`);
        
        await new Promise(r => setTimeout(r, stayTime));

        if (log) log(`[BOBAEDREAM] 체류 완료 및 조회수 반영 성공 예상`);
        return true;

    } catch (e) {
        if (log) log(`[BOBAEDREAM 에러] 부스팅 진행 중 문제 발생: ${e.message}`);
        return false;
    }
};
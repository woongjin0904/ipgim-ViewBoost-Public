
module.exports = async (page, url, log) => {
    try {
        if (log) log(`[BOBAEDREAM] 본문 진입 완료. 사람 모방 스크롤 및 체류 로직 시작...`);

        await page.evaluate(async () => {
            const steps = 5 + Math.floor(Math.random() * 4); 
            for (let i = 0; i < steps; i++) {
                window.scrollBy({ top: 300 + Math.random() * 400, behavior: 'smooth' });
                
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
            }
            
            window.scrollBy({ top: -(200 + Math.random() * 200), behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 1500));
        });

        const randomX = 200 + Math.random() * 300;
        const randomY = 300 + Math.random() * 400;
        await page.mouse.move(randomX, randomY, { steps: 10 }); 
        await page.mouse.click(randomX, randomY);

        const stayTime = 18000 + Math.floor(Math.random() * 7000); 
        if (log) log(`[BOBAEDREAM] 서버 검증 통과 대기 중... (${(stayTime / 1000).toFixed(1)}초)`);
        
        await new Promise(r => setTimeout(r, stayTime));

        if (log) log(`[BOBAEDREAM] 체류 완료 및 조회수 반영 성공 예상`);
        return true;

    } catch (e) {
        if (log) log(`[BOBAEDREAM 에러] 부스팅 진행 중 문제 발생: ${e.message}`);
        return false;
    }
};
module.exports = async (page, url) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');

        await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');
        await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

        await page.setExtraHTTPHeaders({ 
            'referer': 'https://www.google.com/search?q=theqoo',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });

        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 250, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
        });

        const stayTime = 5000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("더쿠 부스팅 에러:", e.message);
        return false;
    }
};



// const path = require('path');

// /**
//  * 더쿠(Theqoo) 전용 부스팅 모듈 (PC/모바일 통합 대응)
//  * 특징: 접속 시마다 강제 로그인, PC/모바일 공통 선택자 사용
//  */
// module.exports = async (page, url) => {
//     try {
//         const client = await page.target().createCDPSession();
//         const loginUrl = 'https://theqoo.net/index.php?act=dispMemberLoginForm';
        
//         // 1. 매회 세션 및 캐시 초기화 (강제 로그인을 위함)
//         await client.send('Network.clearBrowserCookies');
//         await client.send('Network.clearBrowserCache');

//         // 2. 환경 설정 (현재는 모바일 기반이나 PC로 변경해도 작동함)
//         await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');
//         await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
        
//         await page.setExtraHTTPHeaders({ 
//             'referer': 'https://www.google.com/',
//             'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
//         });

//         // 3. 로그인 페이지 접속
//         console.log('[더쿠] 로그인 페이지 접속 시도...');
//         await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 35000 });

//         // 4. 로그인 수행 (PC/모바일 통합 로직)
//         if (process.env.THEQOO_ID && process.env.THEQOO_PW) {
//             // #uid가 나타날 때까지 대기
//             await page.waitForSelector('#uid', { visible: true, timeout: 10000 });

//             // 아이디 입력 (CDP 활용)
//             await page.click('#uid');
//             await client.send('Input.insertText', { text: process.env.THEQOO_ID });
//             await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

//             // 비밀번호 입력
//             await page.click('#upw');
//             await client.send('Input.insertText', { text: process.env.THEQOO_PW });

//             // [핵심] 로그인 버튼 클릭 (PC: .submit, 모바일: .btLogin 모두 대응 가능하도록 처리)
//             const loginButtonSelector = 'input[type="submit"], button.btLogin, .submit.btn.btn-inverse';
//             console.log('[더쿠] 로그인 정보 입력 완료. 버튼 클릭...');
            
//             await Promise.all([
//                 page.click(loginButtonSelector),
//                 page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {})
//             ]);
//         } else {
//             console.error('[더쿠] 환경 변수에 ID/PW 정보가 없습니다.');
//             return false;
//         }

//         // 5. 로그인 성공 확인 후 목표 주소 이동
//         console.log(`[더쿠] 목표 주소 이동: ${url}`);
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });

//         // 6. 팝업 제거 (PC/모바일 공통 처리)
//         try {
//             const closeBtnSelector = '#close-popup-btn';
//             const popupVisible = await page.evaluate((sel) => {
//                 const btn = document.querySelector(sel);
//                 return btn && btn.offsetParent !== null;
//             }, closeBtnSelector);

//             if (popupVisible) {
//                 await page.click(closeBtnSelector);
//                 await new Promise(r => setTimeout(r, 500));
//             }
//         } catch (e) { /* 팝업 없음 */ }

//         // 7. 인간적인 행동 시뮬레이션
//         await page.evaluate(async () => {
//             const loops = 4 + Math.floor(Math.random() * 3);
//             for (let i = 0; i < loops; i++) {
//                 const scrollAmount = 200 + Math.floor(Math.random() * 300);
//                 window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
//                 await new Promise(r => setTimeout(r, 700 + Math.random() * 800));
//             }
//         });

//         // 8. 체류 시간 확보
//         const stayTime = 7000 + Math.floor(Math.random() * 5000);
//         await new Promise(r => setTimeout(r, stayTime));

//         console.log('[더쿠] 프로세스 완료');
//         return true;
//     } catch (e) {
//         console.error("[더쿠] 프로세스 에러:", e.message);
//         return false;
//     }
// };

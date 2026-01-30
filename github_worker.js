const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents'); // 설치 필수: npm install user-agents

// [기존 유지] 네이버 및 펨코 로직 임포트
const runNaver = require('./boosters/naver');
const runFemco = require('./boosters/fmkorea');

const stealth = StealthPlugin();
// [기존 유지] UA 오버라이드 비활성화 (직접 설정하기 위함)
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(stealth);

async function start() {
    const targetUrl = process.argv[2];
    const siteType = process.argv[3];
    const totalCount = parseInt(process.argv[4] || "0");
    const workerId = parseInt(process.env.WORKER_ID || "1");

    if (!targetUrl || totalCount <= 0) {
        console.log("실행 조건 미충족. 종료.");
        process.exit(0);
    }

    // [기존 유지] 워커별 할당량 계산 로직
    let myIterations = Math.floor(totalCount / 20);
    if (workerId <= (totalCount % 20)) {
        myIterations += 1;
    }

    if (myIterations <= 0) {
        console.log(`[Worker ${workerId}] 할당량 없음.`);
        process.exit(0);
    }

    console.log(`[Worker ${workerId}] 시작. 목표: ${myIterations}회`);

    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1280,800',
            '--disable-gpu',
            '--no-first-run',
            '--js-flags="--max-old-space-size=512"'
        ]
    });

    try {
        for (let i = 1; i <= myIterations; i++) {
            console.log(`[${workerId}] 시도 ${i}/${myIterations} 진행 중...`);
            
            // [보강] 매 시도마다 완전히 새로운 브라우저 컨텍스트 사용 (쿠키/세션 분리)
            const context = await browser.createBrowserContext();
            const page = await context.newPage();
            
            // [보강] 랜덤 User-Agent 생성 및 적용
            const ua = new UserAgent({ deviceCategory: 'desktop' }).toString();
            await page.setUserAgent(ua);

            // [기존 유지] 봇 탐지 우회 설정
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                window.chrome = { runtime: {} };
            });

            // [수정/보강] 리소스 차단 로직 최적화 (조회수 로그 스크립트 허용)
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                const url = req.url();

                // 네이버 분석 스크립트(lcs.naver.com)는 절대 차단하면 안 됩니다.
                if (url.includes('naver.com') || url.includes('naver.net') || url.includes('pstatic.net')) {
                    return req.continue();
                }

                // 이미지와 폰트만 차단하여 속도 향상
                if (['image', 'font', 'media'].includes(type)) {
                    return req.abort();
                }
                req.continue();
            });

            // [기존 유지] 사이트별 실행 분기
            if (siteType === 'NAVER') {
                await runNaver(page, targetUrl, (msg) => console.log(`[Worker ${workerId}] ${msg}`));
            } else if (siteType === 'FEMCO') {
                await runFemco(page, targetUrl);
            }
            
            // [보강] 페이지가 아닌 컨텍스트를 닫아 데이터 완전 삭제
            await context.close();
            
            // [기존 유지] 다음 시도 전 랜덤 대기
            await new Promise(r => setTimeout(r, 3000 + Math.random() * 4000));
        }
    } catch (e) {
        console.error(`[Worker ${workerId}] 치명적 오류:`, e.message);
    } finally {
        await browser.close();
        process.exit(0);
    }
}

start();
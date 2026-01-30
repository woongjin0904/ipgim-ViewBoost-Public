const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents'); // 설치 확인 필요: npm install user-agents

const stealth = StealthPlugin();
// Stealth 플러그인이 UA 오버라이드를 제어하게 두는 것이 더 안전합니다.
puppeteer.use(stealth);

async function start() {
    const targetUrl = process.argv[2];
    const siteType = process.argv[3];
    const totalCount = parseInt(process.argv[4] || "0");
    const workerId = parseInt(process.env.WORKER_ID || "1");

    if (!targetUrl || totalCount <= 0) {
        process.exit(0);
    }

    let myIterations = Math.floor(totalCount / 20);
    if (workerId <= (totalCount % 20)) myIterations += 1;

    console.log(`[Worker ${workerId}] 시작. 할당량: ${myIterations}회`);

    // 브라우저 실행 (최대한 일반 크롬처럼 보이게 설정)
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--lang=ko_KR'
        ]
    });

    try {
        for (let i = 1; i <= myIterations; i++) {
            // 1. 매번 독립된 브라우저 컨텍스트(Incognito 모드 효과) 생성
            const context = await browser.createBrowserContext();
            const page = await context.newPage();

            // 2. 랜덤 User-Agent 설정
            const userAgent = new UserAgent({ deviceCategory: 'desktop' });
            await page.setUserAgent(userAgent.toString());

            // 3. 화면 크기 랜덤화 (브라우저 지문 다양화)
            await page.setViewport({
                width: 1280 + Math.floor(Math.random() * 500),
                height: 800 + Math.floor(Math.random() * 200),
                deviceScaleFactor: 1,
            });

            // 4. 리소스 차단 최적화 (lcs.naver.com 로그 스크립트는 절대 차단 금지)
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                const url = req.url();
                if (['image', 'font', 'media'].includes(type)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            console.log(`[Worker ${workerId}] 시도 ${i}/${myIterations}...`);

            try {
                if (siteType === 'NAVER') {
                    await runNaver(page, targetUrl, (msg) => console.log(`[W ${workerId}] ${msg}`));
                } else if (siteType === 'FEMCO') {
                    await runFemco(page, targetUrl);
                }
            } catch (err) {
                console.log(`[Worker ${workerId}] 개별 페이지 오류 건너뜀`);
            }

            // 5. 컨텍스트 닫기 (쿠키/세션 완전 삭제)
            await context.close();

            // 대기 시간 증가 (네이버는 너무 빠르면 봇으로 간주)
            const wait = 5000 + Math.random() * 5000;
            await new Promise(r => setTimeout(r, wait));
        }
    } catch (e) {
        console.error(`[Worker ${workerId}] 치명적 오류:`, e.message);
    } finally {
        await browser.close();
        process.exit(0);
    }
}

start();
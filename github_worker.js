const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

// [기존 유지] 네이버 및 펨코 로직 임포트
const runNaver = require('./boosters/naver');
const runFemco = require('./boosters/fmkorea');

const stealth = StealthPlugin();
// [기존 유지] user-agent-override 삭제 설정 유지
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

    // [기존 유지] 워커 할당량 계산 로직
    let myIterations = Math.floor(totalCount / 20);
    if (workerId <= (totalCount % 20)) {
        myIterations += 1;
    }

    if (myIterations <= 0) {
        console.log(`[Worker ${workerId}] 할당량 없음.`);
        process.exit(0);
    }

    console.log(`[Worker ${workerId}] 시작. 목표: ${myIterations}회`);

    // [기존 유지] 브라우저 설정 유지
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

            // [수정] 에러 방지용 컨텍스트 생성 로직 (함수 존재 여부 체크)
            let context;
            if (typeof browser.createIncognitoBrowserContext === 'function') {
                context = await browser.createIncognitoBrowserContext();
            } else if (typeof browser.createBrowserContext === 'function') {
                context = await browser.createBrowserContext();
            } else {
                context = browser; // 함수가 없는 경우 기본 브라우저 사용
            }

            const page = await (context === browser ? browser.newPage() : context.newPage());
            
            // [추가] 랜덤 User-Agent 적용 (조회수 누락 방지 핵심)
            const userAgent = new UserAgent({ deviceCategory: 'desktop' });
            await page.setUserAgent(userAgent.toString());

            // [기존 유지] 봇 탐지 우회 로직
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                window.chrome = { runtime: {} };
            });

            // [기존 유지 및 최적화] 리소스 차단 로직
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                const url = req.url();

                if (url.includes('naver.com') || url.includes('naver.net') || url.includes('pstatic.net')) {
                    return req.continue();
                }

                if (['image', 'font', 'media'].includes(type)) {
                    return req.abort();
                }
                req.continue();
            });

            // [기존 유지] 사이트 실행 로직
            if (siteType === 'NAVER') {
                await runNaver(page, targetUrl, (msg) => console.log(`[Worker ${workerId}] ${msg}`));
            } else if (siteType === 'FEMCO') {
                await runFemco(page, targetUrl);
            }
            
            // [수정] 세션 종료 및 정리
            if (context !== browser) {
                await context.close();
            } else {
                await page.close();
            }

            // [기존 유지] 랜덤 대기 시간
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
        }
    } catch (e) {
        console.error(`[Worker ${workerId}] 치명적 오류:`, e.message);
    } finally {
        await browser.close();
        process.exit(0);
    }
}

start();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

// 주의: puppeteer-extra를 쓸 때도 puppeteer-core를 엔진으로 사용하도록 설정
const runNaver = require('./boosters/naver');
const runFemco = require('./boosters/fmkorea');

const stealth = StealthPlugin();
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

    let myIterations = Math.floor(totalCount / 20);
    if (workerId <= (totalCount % 20)) {
        myIterations += 1;
    }

    if (myIterations <= 0) {
        console.log(`[Worker ${workerId}] 할당량 없음.`);
        process.exit(0);
    }

    console.log(`[Worker ${workerId}] 시작. 목표: ${myIterations}회`);

        // github_worker.js 내부 브라우저 설정 부분
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled', // 자동화 흔적 제거
            '--window-size=1280,800',
            '--disable-gpu',
            '--no-first-run',
            '--js-flags="--max-old-space-size=512"'
        ]
    });

    try {
        for (let i = 1; i <= myIterations; i++) {
            console.log(`[${workerId}] 시도 ${i}/${myIterations} 진행 중...`);

            const page = await browser.newPage();

            await page.setUserAgent(new UserAgent({ deviceCategory: 'desktop' }).toString());
            // [추가] 봇 탐지 우회 스크립트 주입
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });

            // [추가] 리소스 차단 로직 (ERR_BLOCKED_BY_CLIENT 해결책)
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                const url = req.url();

                // 네이버 카페 핵심 리소스는 무조건 통과 (차단하면 에러 발생)
                if (url.includes('naver.com') || url.includes('naver.net')) {
                    return req.continue();
                }

                // 이미지, 폰트, 미디어만 차단하여 속도 향상
                if (['image', 'font', 'media'].includes(type)) {
                    return req.abort();
                }

                req.continue();
            });
            if (siteType === 'NAVER') {
                await runNaver(page, targetUrl, (msg) => console.log(msg));
            } else if (siteType === 'FEMCO') {
                await runFemco(page, targetUrl);
            }
            
            await page.close();
            if (i < myIterations) await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
        }
    } catch (e) {
        console.error("오류 발생:", e.message);
    } finally {
        await browser.close();
        console.log(`[Worker ${workerId}] 완료.`);
        process.exit(0);
    }
}

start();
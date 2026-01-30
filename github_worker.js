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
            
            // 봇 탐지 우회
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });

            // [수정] 리소스 차단 로직 최적화
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                const url = req.url();

                // 1. 네이버 관련 필수 데이터는 무조건 허용 (차단 시 ERR_BLOCKED_BY_CLIENT 유발)
                if (url.includes('naver.com') || url.includes('naver.net') || url.includes('pstatic.net')) {
                    return req.continue();
                }

                // 2. 이미지, 폰트, 미디어만 차단 (네이버 카페는 CSS/JS를 차단하면 작동 안 함)
                // 이전 코드에서 stylesheet를 차단했다면 여기서 에러가 났을 확률이 높습니다.
                if (['image', 'font', 'media'].includes(type)) {
                    return req.abort();
                }

                // 3. 나머지는 일단 통과 (안전 제일)
                req.continue();
            });

            // [추가] 브라우저 지문(Fingerprint)을 좀 더 확실히 속임
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                window.chrome = { runtime: {} };
            });

            // 실행
            if (siteType === 'NAVER') {
                await runNaver(page, targetUrl, (msg) => console.log(`[Worker ${workerId}] ${msg}`));
            } else if (siteType === 'FEMCO') {
                await runFemco(page, targetUrl);
            }
            
            await page.close();
            // 다음 시도 전 랜덤 대기
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
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
                const url = req.url();
                const type = req.resourceType();

                // 네이버 필수 도메인 화이트리스트 (pstatic.net 추가 필수)
                const isNaverResource = /naver\.com|naver\.net|pstatic\.net/.test(url);

                if (isNaverResource) {
                    req.continue();
                } else if (['image', 'font', 'media'].includes(type)) {
                    req.abort(); // 용량 큰 미디어만 차단
                } else {
                    req.continue();
                }
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
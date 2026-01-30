const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

// [추가] 모든 부스터 모듈 임포트 (경로가 깃허브 레포지토리 내에 있어야 합니다)
const runInstiz = require('./boosters/instiz');
const runTheqoo = require('./boosters/theqoo');
const runPpomppu = require('./boosters/ppomppu');
const runFemco = require('./boosters/fmkorea');
const runNaver = require('./boosters/naver');
const runRuliweb = require('./boosters/ruliweb');
const runQuasarzone = require('./boosters/quasarzone');
const runArcalive = require('./boosters/arcalive');
const runInven = require('./boosters/inven');
const runDogdrip = require('./boosters/dogdrip');
const runDcinside = require('./boosters/dcinside');
const runDonppu = require('./boosters/donppu');

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(stealth);

// [추가] 사이트 타입별 실행 매핑 객체
const boosters = {
    INSTIZ: runInstiz,
    THEQOO: runTheqoo,
    PPOMPPU: runPpomppu,
    FEMCO: runFemco,
    NAVER: runNaver,
    RULIWEB: runRuliweb,
    QUASARZONE: runQuasarzone,
    ARCALIVE: runArcalive,
    INVEN: runInven,
    DOGDRIP: runDogdrip,
    DCINSIDE: runDcinside,
    DONPPU: runDonppu
};

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

    console.log(`[Worker ${workerId}] 시작. 사이트: ${siteType}, 목표: ${myIterations}회`);

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

            let context;
            if (typeof browser.createIncognitoBrowserContext === 'function') {
                context = await browser.createIncognitoBrowserContext();
            } else {
                context = browser; 
            }

            const page = await (context === browser ? browser.newPage() : context.newPage());
            
            const userAgent = new UserAgent({ deviceCategory: 'desktop' });
            await page.setUserAgent(userAgent.toString());

            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                window.chrome = { runtime: {} };
            });

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                // 네이버 관련 리소스는 허용, 그 외 이미지/폰트 등은 차단하여 속도 향상
                if (req.url().includes('naver.com') || req.url().includes('naver.net')) {
                    return req.continue();
                }
                if (['image', 'font', 'media'].includes(type)) {
                    return req.abort();
                }
                req.continue();
            });

            // [수정된 핵심 로직] 매핑 객체를 사용하여 모든 사이트 대응
            const runBooster = boosters[siteType];
            if (runBooster) {
                // 부스터 실행 (성공/실패 여부와 상관없이 시도)
                await runBooster(page, targetUrl, (msg) => console.log(`[Worker ${workerId}] ${msg}`)).catch(e => {
                    console.log(`[Worker ${workerId}] 개별 시도 에러: ${e.message}`);
                });
            } else {
                console.log(`[Worker ${workerId}] 지원하지 않는 사이트 타입: ${siteType}`);
                break; 
            }
            
            if (context !== browser) {
                await context.close();
            } else {
                await page.close();
            }

            await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
        }
    } catch (e) {
        console.error(`[Worker ${workerId}] 치명적 에러:`, e.message);
    } finally {
        await browser.close();
        process.exit(0);
    }
}

start();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

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
const runDaum = require('./boosters/daum');
const runDimitory = require('./boosters/dimitory');
const runFancug = require('./boosters/fancug');
const runThredic = require('./boosters/thredic');
const runEtoland = require('./boosters/etoland');
const runNatepann = require('./boosters/natepann'); 
const runBobaedream = require('./boosters/bobaedream');
const runMlbpark = require('./boosters/mlbpark'); 
const runEomisae = require('./boosters/eomisae');
const runMimint = require('./boosters/mimint');
const runJayoung = require('./boosters/jayoung');
const runNaverKin = require('./boosters/naver_kin');
const runBlind = require('./boosters/blind');
const runYgosu = require('./boosters/ygosu');
const runDealbada = require('./boosters/dealbada');
const runTe31 = require('./boosters/te');
const runZod = require('./boosters/zod');
const runDasaja = require('./boosters/dasaja');
const runDeokjil = require('./boosters/deokjil');
const runSlrclub = require('./boosters/slrclub');

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(stealth);

const boosters = {
    INSTIZ: runInstiz, THEQOO: runTheqoo, PPOMPPU: runPpomppu,
    FEMCO: runFemco, NAVER: runNaver, RULIWEB: runRuliweb, NAVER_KIN: runNaverKin,
    QUASARZONE: runQuasarzone, ARCALIVE: runArcalive, INVEN: runInven,
    DOGDRIP: runDogdrip, DCINSIDE: runDcinside, DONPPU: runDonppu, DAUM: runDaum,
    DIMITORY: runDimitory, FANCUG: runFancug, THREDIC: runThredic, ETOLAND: runEtoland,
    NATEPANN: runNatepann, BOBAEDREAM: runBobaedream, MLBPARK: runMlbpark,
    EOMISAE: runEomisae, MIMINT: runMimint, JAYOUNG: runJayoung,
    BLIND: runBlind, DEALBADA: runDealbada, TE31: runTe31, ZOD: runZod,
    DASAJA: runDasaja, DEOKJIL: runDeokjil,     SLRCLUB: runSlrclub,
};

async function start() {
    const targetUrl = process.argv[2];
    const siteType = process.argv[3];
    const totalCount = parseInt(process.argv[4] || "0");
    const userId = process.argv[5] || "UnknownUser"; 
    const delay = parseInt(process.argv[6] || "5", 10);
    const workerId = parseInt(process.env.WORKER_ID || "1");

    if (!targetUrl || totalCount <= 0) {
        console.log(`[${userId}] 실행 조건 미충족. 종료.`);
        process.exit(0);
    }

    let myIterations = Math.floor(totalCount / 20);
    if (workerId <= (totalCount % 20)) {
        myIterations += 1;
    }

    if (myIterations <= 0) {
        console.log(`[${userId}][Worker ${workerId}] 할당량 없음.`);
        process.exit(0);
    }

    console.log(`🚀 [사용자: ${userId}] 워커 ${workerId} 가동 (대상: ${siteType}, 목표: ${myIterations}회)`);

    // MongoDB 연결 (1회)
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    let dbClient = null;
    let progressCollection = null;

    if (uri) {
        try {
            dbClient = new MongoClient(uri);
            await dbClient.connect();
            progressCollection = dbClient.db('global_auth_center').collection('cloud_progress');
            console.log(`[${userId}][W${workerId}] MongoDB 실시간 집계 연결 성공`);
        } catch (initDbErr) {
            console.error(`[${userId}][W${workerId}] MongoDB 초기 연결 실패:`, initDbErr.message);
        }
    } else {
        console.log("[MongoDB 오류] MONGODB_URI 환경변수가 누락되었습니다.");
    }

    const launchBrowser = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await puppeteer.launch({
                    executablePath: '/usr/bin/google-chrome',
                    headless: "new",
                    timeout: 60000, 
                    args: [
                        '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
                        '--disable-blink-features=AutomationControlled', '--window-size=1280,800',
                        '--disable-gpu', '--no-first-run', '--js-flags="--max-old-space-size=512"'
                    ]
                });
            } catch (e) {
                console.log(`[${userId}][Retry ${i+1}] 브라우저 실행 실패: ${e.message}`);
                if (i === retries - 1) throw e;
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    };

    const browser = await launchBrowser();

    try {
        // 💡 [큐 분할 설정] 와이고수는 100개씩, 나머지는 기존처럼 전체 진행
        const BATCH_SIZE = siteType === 'YGOSU' ? 100 : myIterations; 
        const tasks = Array.from({ length: myIterations }, (_, i) => i + 1);

        for (let q = 0; q < tasks.length; q += BATCH_SIZE) {
            const currentQueue = tasks.slice(q, q + BATCH_SIZE);
            const queueNumber = Math.floor(q / BATCH_SIZE) + 1;
            const totalQueues = Math.ceil(tasks.length / BATCH_SIZE);

            if (siteType === 'YGOSU') {
                console.log(`\n📦 [${userId}][W${workerId}] YGOSU 큐 ${queueNumber}/${totalQueues} 시작 (할당량: ${currentQueue.length}개)`);
            }

            // 큐(100개 묶음) 내부 반복
            for (const taskNum of currentQueue) {
                try {
                    console.log(`[${userId}][W${workerId}] 진행: ${taskNum}/${myIterations} (현재 큐: ${queueNumber}번)`);

                    let context = await browser.createIncognitoBrowserContext().catch(() => browser);
                    const page = await (context === browser ? browser.newPage() : context.newPage());
                    
                    page.setDefaultNavigationTimeout(45000);
                    page.setDefaultTimeout(45000);

                    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                    await page.setExtraHTTPHeaders({
                        'referer': 'https://www.google.com/',
                        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
                    });

                    await page.setRequestInterception(true);
                    page.on('request', (req) => {
                        const url = req.url();
                        const type = req.resourceType();
                        const allowedDomains = ['naver.com', 'naver.net', 'daum.net', 'daumcdn.net', 'kakao.com', 'nate.com'];
                        if (allowedDomains.some(domain => url.includes(domain))) return req.continue();
                        if (['image', 'font', 'media'].includes(type)) return req.abort();
                        req.continue();
                    });

                    const runBooster = boosters[siteType];
                    let isSuccess = false;

                    if (runBooster) {
                        isSuccess = await runBooster(page, targetUrl, (msg) => 
                            console.log(`[${userId}][W${workerId}] ${msg}`)
                        ).then(() => true).catch(e => {
                            console.log(`[${userId}][W${workerId}] 시도 실패: ${e.message}`);
                            return false;
                        });
                    } else {
                        console.log(`[${userId}][W${workerId}] 미지원 사이트: ${siteType}`);
                        break; 
                    }
                    
                    if (context !== browser) await context.close().catch(() => {});
                    else await page.close().catch(() => {});

                    // MongoDB 진행률 업데이트
                    if (isSuccess && progressCollection) {
                        try {
                            await progressCollection.updateOne(
                                { userId: userId, url: targetUrl, siteName: siteType },
                                { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
                                { upsert: true }
                            );
                            console.log(`[MongoDB 기록] ${siteType} 카운트 1 누적 완료`);
                        } catch (dbErr) {
                            console.log(`[MongoDB 기록 실패]: ${dbErr.message}`);
                        }
                    }
                    
                    // 기본 딜레이
                    await new Promise(r => setTimeout(r, (delay * 1000) + Math.random() * 2000));

                } catch (iterationError) {
                    console.error(`[${userId}][W${workerId}] 에러 발생:`, iterationError.message);
                    await new Promise(r => setTimeout(r, 5000));
                }
            } // end of queue inner loop

            // 💡 [큐 완료 후 휴식] 와이고수 전용 - 100개 완료 후 10~15초 휴식하여 밴 방지
            if (siteType === 'YGOSU' && queueNumber < totalQueues) {
                const queueDelay = 10000 + Math.random() * 5000;
                console.log(`⏳ 큐 ${queueNumber} 완료. 다음 큐 진입 전 ${(queueDelay/1000).toFixed(1)}초 대기...`);
                await new Promise(r => setTimeout(r, queueDelay));
            }
        } // end of outer loop
    } catch (e) {
        console.error(`[${userId}][W${workerId}] 치명적 에러:`, e.message);
    } finally {
        if (browser) await browser.close().catch(() => {});
        if (dbClient) await dbClient.close().catch(() => {});
        console.log(`🏁 [${userId}][W${workerId}] 작업 완료 및 종료.`);
        process.exit(0);
    }
}
start();



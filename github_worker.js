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

    const launchBrowser = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await puppeteer.launch({
                    executablePath: '/usr/bin/google-chrome',
                    headless: "new",
                    timeout: 60000, 
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
            } catch (e) {
                console.log(`[${userId}][Retry ${i+1}] 브라우저 실행 실패: ${e.message}`);
                if (i === retries - 1) throw e;
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    };

    const browser = await launchBrowser();

    try {
        for (let i = 1; i <= myIterations; i++) {
            try {
                console.log(`[${userId}][W${workerId}] 진행: ${i}/${myIterations}`);

                let context = await browser.createIncognitoBrowserContext().catch(() => browser);
                const page = await (context === browser ? browser.newPage() : context.newPage());
                
                page.setDefaultNavigationTimeout(45000);
                page.setDefaultNavigationTimeout(45000);

                // 무작위 UA 대신 신뢰도 높은 최신 Chrome UA 고정 사용 (Stealth 플러그인과 궁합이 좋음)
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

                // 우회를 위한 기본 헤더 추가
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
                let isSuccess = false; // 💡 성공 여부 추적 변수 추가

                if (runBooster) {
                    // 💡 .then(() => true)를 통해 성공 기록
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

                // 💡 MongoDB 카운트 적재 로직 추가
                if (isSuccess) {
                    const { MongoClient } = require('mongodb');
                    const uri = process.env.MONGODB_URI;
                    
                    if (!uri) {
                        console.log("[MongoDB 오류] MONGODB_URI 환경변수가 누락되었습니다.");
                    } else {
                        const client = new MongoClient(uri);
                        try {
                            await client.connect();
                            const db = client.db('global_auth_center');
                            
                            await db.collection('cloud_progress').updateOne(
                                { userId: userId, url: targetUrl, siteName: siteType },
                                { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
                                { upsert: true }
                            );
                            console.log(`[MongoDB 기록] ${siteType} 카운트 1 누적 완료`);
                        } catch (dbErr) {
                            console.log(`[MongoDB 기록 실패]: ${dbErr.message}`);
                        } finally {
                            await client.close();
                        }
                    }
                }
                
                // 💡 delay 변수를 활용한 대기 시간
                await new Promise(r => setTimeout(r, (delay * 1000) + Math.random() * 2000));

            } catch (iterationError) {
                console.error(`[${userId}][W${workerId}] 에러 발생:`, iterationError.message);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    } catch (e) {
        console.error(`[${userId}][W${workerId}] 치명적 에러:`, e.message);
    } finally {
        if (browser) await browser.close().catch(() => {});
        console.log(`🏁 [${userId}][W${workerId}] 작업 완료 및 종료.`);
        process.exit(0);
    }
}

start();



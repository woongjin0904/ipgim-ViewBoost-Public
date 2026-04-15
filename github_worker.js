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

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(stealth);

const boosters = {
    INSTIZ: runInstiz, THEQOO: runTheqoo, PPOMPPU: runPpomppu,
    FEMCO: runFemco, NAVER: runNaver, RULIWEB: runRuliweb,
    QUASARZONE: runQuasarzone, ARCALIVE: runArcalive, INVEN: runInven,
    DOGDRIP: runDogdrip, DCINSIDE: runDcinside, DONPPU: runDonppu, DAUM: runDaum,
    DIMITORY: runDimitory, FANCUG: runFancug, THREDIC: runThredic, ETOLAND: runEtoland,
    NATEPANN: runNatepann
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
                const userAgent = new UserAgent({ deviceCategory: 'desktop' });
                await page.setUserAgent(userAgent.toString());

                await page.evaluateOnNewDocument(() => {
                // 1. 완벽한 window.chrome 모방 (메서드까지 흉내 내기)
                window.chrome = {
                    app: {
                        isInstalled: false,
                        InstallState: {
                            DISABLED: 'disabled',
                            ERROR_MAC_FORBIDDEN: 'error_mac_forbidden',
                            ERROR_INVALID_URL: 'error_invalid_url',
                            ERROR_CONFLICTING_REQUEST: 'error_conflicting_request',
                            ERROR_NOT_SUPPORTED: 'error_not_supported',
                            ERROR_ALREADY_REQUESTED: 'error_already_requested',
                            INSTALLED: 'installed',
                            NOT_INSTALLED: 'not_installed'
                        },
                        RunningState: {
                            CANNOT_RUN: 'cannot_run',
                            READY_TO_RUN: 'ready_to_run',
                            RUNNING: 'running'
                        },
                        getDetails: function() {},
                        getIsInstalled: function() {},
                        installState: function() {},
                        isDetailsAvailable: function() {},
                        runningState: function() {}
                    },
                    csi: function() {},
                    loadTimes: function() {},
                    runtime: {}
                };

                // 2. Webdriver 흔적 완벽 제거 (false보다 undefined가 더 자연스럽습니다)
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });

                // 3. 플러그인 속이기
                // Headless 크롬은 플러그인이 0개지만, 실제 크롬은 PDF 뷰어 등을 기본으로 가집니다.
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [
                        {
                            0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin},
                            description: "Portable Document Format",
                            filename: "internal-pdf-viewer",
                            length: 1,
                            name: "Chrome PDF Plugin"
                        },
                        {
                            0: {type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin},
                            description: "",
                            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                            length: 1,
                            name: "Chrome PDF Viewer"
                        }
                    ],
                });

                // 4. 언어 설정 (한국어 유저처럼 보이기)
                // Headless 크롬은 가끔 'en-US'로만 잡히는 경우가 있어 강제 세팅이 필요합니다.
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['ko-KR', 'ko', 'en-US', 'en'],
                });
                
                // 5. WebGL 그래픽 카드 벤더 속이기 (핵심!)
                // Headless 모드일 때 그래픽카드가 "Google SwiftShader"로 뜨면 바로 봇으로 컷당합니다.
                const getParameter = WebGLRenderingContext.prototype.getParameter;
                WebGLRenderingContext.prototype.getParameter = function(parameter) {
                    // 37445 === UNMASKED_VENDOR_WEBGL
                    if (parameter === 37445) {
                        return 'Intel Inc.'; // 흔한 내장 그래픽 제조사로 위장
                    }
                    // 37446 === UNMASKED_RENDERER_WEBGL
                    if (parameter === 37446) {
                        return 'Intel Iris OpenGL Engine'; // 흔한 그래픽카드 렌더러로 위장
                    }
                    return getParameter.call(this, parameter);
                };
            });
                    // 권한(Permissions) API 모방 (알림 권한 거부 상태로)
                    const originalQuery = window.navigator.permissions.query;
                    return window.navigator.permissions.query = (parameters) => (
                        parameters.name === 'notifications' ?
                            Promise.resolve({ state: Notification.permission }) :
                            originalQuery(parameters)
                    );
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
                if (runBooster) {
                    await runBooster(page, targetUrl, (msg) => 
                        console.log(`[${userId}][W${workerId}] ${msg}`)
                    ).catch(e => {
                        console.log(`[${userId}][W${workerId}] 시도 실패: ${e.message}`);
                    });
                } else {
                    console.log(`[${userId}][W${workerId}] 미지원 사이트: ${siteType}`);
                    break; 
                }
                
                if (context !== browser) await context.close().catch(() => {});
                else await page.close().catch(() => {});

                await new Promise(r => setTimeout(r, 1500 + Math.random() * 2500));

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
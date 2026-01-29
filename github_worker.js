const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

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

    // 💡 20분할 정밀 배분 로직
    let myIterations = Math.floor(totalCount / 20);
    if (workerId <= (totalCount % 20)) {
        myIterations += 1;
    }

    if (myIterations <= 0) {
        console.log(`[Worker ${workerId}] 나에게 할당된 수량이 없습니다. (총 목표: ${totalCount})`);
        process.exit(0);
    }

    console.log(`[Worker ${workerId}] 시작. 목표: ${myIterations}회 실행 (전체: ${totalCount})`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    try {
        for (let i = 1; i <= myIterations; i++) {
            console.log(`[시도 ${i}/${myIterations}] ${siteType} 작업 진행 중...`);
            const page = await browser.newPage();
            await page.setUserAgent(new UserAgent({ deviceCategory: 'desktop' }).toString());

            if (siteType === 'NAVER') {
                await runNaver(page, targetUrl, (msg) => console.log(msg));
            } else if (siteType === 'FEMCO') {
                await runFemco(page, targetUrl);
            } else {
                console.error(`지원하지 않는 사이트 타입: ${siteType}`);
                break;
            }
            
            await page.close();
            if (i < myIterations) await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
        }
    } catch (e) {
        console.error("작업 중 오류 발생:", e.message);
    } finally {
        await browser.close();
        console.log(`[Worker ${workerId}] 모든 할당 작업 완료.`);
        process.exit(0);
    }
}

start();
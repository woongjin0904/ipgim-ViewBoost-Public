const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

// 기존 모듈 로드 (로직 수정 없음)
const runNaver = require('./boosters/naver');
const runFemco = require('./boosters/fmkorea');

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(stealth);

async function start() {
    const targetUrl = process.argv[2]; // 실행 시 받은 URL
    const siteType = process.argv[3];  // NAVER 또는 FEMCO
    const iterations = parseInt(process.argv[4] || "1"); // 반복 횟수

    if (!targetUrl) {
        console.error("URL이 없습니다.");
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    try {
        for (let i = 1; i <= iterations; i++) {
            console.log(`[시도 ${i}/${iterations}] ${siteType} 작업 시작...`);
            const page = await browser.newPage();
            await page.setUserAgent(new UserAgent({ deviceCategory: 'desktop' }).toString());

            if (siteType === 'NAVER') {
                await runNaver(page, targetUrl, (msg) => console.log(msg));
            } else {
                await runFemco(page, targetUrl);
            }
            
            await page.close();
            // 각 반복 사이의 랜덤 대기
            if (i < iterations) await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
        }
    } catch (e) {
        console.error("작업 중 오류:", e.message);
    } finally {
        await browser.close();
        process.exit(0);
    }
}

start();
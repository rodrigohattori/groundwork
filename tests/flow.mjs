import puppeteer from 'puppeteer-core';

const BASE = 'http://127.0.0.1:8904';
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
const text = async (page, sel) => page.$eval(sel, (e) => e.textContent).catch(() => null);
const count = async (page, sel) => page.$$eval(sel, (es) => es.length).catch(() => 0);
const goHash = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(400); };
const clickInCard = async (page, cardIdx, btnIdx) => {
  const cards = await page.$$('.theme:not(.is-done)');
  const btns = await cards[cardIdx].$$('.theme-actions .btn');
  await btns[btnIdx].click();
  await sleep(250);
};

let page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(BASE + '/#/', { waitUntil: 'networkidle0' });
await sleep(400);

check('opens on review queue', (await text(page, '.page-head h1')) === 'Review queue');
check('10 pending theme cards', (await count(page, '.theme:not(.is-done)')) === 10);
check('run-synthesis button present', /Run new synthesis/.test((await text(page, '.gw-run-row')) ?? ''));

// static build: real run must fail loudly, not fake
await page.click('.gw-run-row .btn'); await sleep(1200);
check('static build shows unavailable notice, no fake run', /did not run|static|endpoint/i.test((await text(page, '.gw-callout, [class*=callout]')) ?? (await page.evaluate(() => document.body.innerText))));
check('still 10 pending after failed run', (await count(page, '.theme:not(.is-done)')) === 10);

// evidence toggle
await page.click('.theme:not(.is-done) .evidence-toggle'); await sleep(250);
check('evidence expands', (await count(page, '.theme:not(.is-done) .gw-citation')) > 0);
await page.click('.theme:not(.is-done) .evidence-toggle'); await sleep(250);
check('evidence collapses', (await count(page, '.theme:not(.is-done) .gw-citation')) === 0);

// reject with reason on card index 1
await clickInCard(page, 1, 3); // Reject
check('reject panel opens', (await count(page, '.theme-panel input')) === 1);
await page.type('.theme-panel input', 'Teste: evidencia insuficiente'); await sleep(200);
const confirmReject = await page.$('.theme-panel > .btn.v-primary, .theme-panel .btn.v-primary');
await confirmReject.click(); await sleep(400);
check('reject moves card out of pending', (await count(page, '.theme:not(.is-done)')) === 9);
check('stats show 1 rejected', /1 rejected/.test((await text(page, '.queue-stats')) ?? ''));
const chips = await page.$$('.queue-toolbar .chip');
await chips[1].click(); await sleep(400);
check('reviewed filter shows rejected card', (await count(page, '.theme.is-done')) === 1);
check('rejected card shows reason', /evidencia insuficiente/.test((await text(page, '.theme.is-done')) ?? ''));
const chips2 = await page.$$('.queue-toolbar .chip');
await chips2[2].click(); await sleep(300); // All

// merge flow on first pending card
await clickInCard(page, 0, 2); // Mark duplicate
const mergeCount = await count(page, '.theme-panel .gw-merge-row .btn');
check('merge panel lists targets', mergeCount > 0, `got ${mergeCount}`);
const mergeBtns = await page.$$('.theme-panel .gw-merge-row .btn');
await mergeBtns[1].click(); await sleep(200);
await page.type('.theme-panel input', 'mesmo problema relatado'); await sleep(200);
const confirms = await page.$$('.theme-panel > .btn.v-primary');
await confirms[0].click(); await sleep(400);
check('merge marks duplicate (8 pending)', (await count(page, '.theme:not(.is-done)')) === 8, `got ${await count(page, '.theme:not(.is-done)')}`);

// approve flow
await clickInCard(page, 0, 0); // Approve as signal (auto-commits, no panel)
check('approve drops pending to 7', (await count(page, '.theme:not(.is-done)')) === 7);

// decision log
await goHash(page, '/decisions');
check('decision log has 3 entries', (await count(page, '.decision')) === 3, `got ${await count(page, '.decision')}`);
await page.reload({ waitUntil: 'networkidle0' }); await sleep(400);
check('decisions persist after reload', (await count(page, '.decision')) === 3);

// feedback filters
await goHash(page, '/feedback');
await page.type('.filters-bar input', 'pix'); await sleep(300);
const shown = (await text(page, '.gw-note')) ?? '';
check('search narrows items', /of 73 items shown/.test(shown) && !/^73 of 73/.test(shown), shown);
const wrapCount = await count(page, '.filters-bar .chips-wrap');
const chanChips = await page.$$('.filters-bar .chips-wrap:nth-of-type(3) .chip, .filters-bar .chips-wrap .chip');
console.log('DEBUG wraps=' + wrapCount + ' chips=' + chanChips.length);
await page.click('.filters-bar input'); await page.keyboard.press('End'); await page.keyboard.down('Shift'); await page.keyboard.press('Home'); await page.keyboard.up('Shift'); await page.keyboard.press('Backspace'); await sleep(250);
const fresh = await page.$$('.filters-bar .chips-wrap');
const cc = await fresh[0].$$('.chip');
await cc[2].click(); await sleep(300);
const shown2 = (await text(page, '.gw-note')) ?? '';
check('channel filter narrows items', /^\d+ of 73/.test(shown2) && !/^73 of 73/.test(shown2) && !/^0 of 73/.test(shown2), shown2);
await page.close();

// mobile
const ctx = await browser.createBrowserContext();
page = await ctx.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto(BASE + '/#/', { waitUntil: 'networkidle0' }); await sleep(400);
check('mobile: brand visible', (await text(page, '.app-brand')) !== null);
check('mobile: queue renders', (await text(page, '.page-head h1')) === 'Review queue');
check('mobile: nav horizontal', (await page.$eval('.app-nav', (e) => getComputedStyle(e).flexDirection)) === 'row');
await page.click('.theme:not(.is-done) .evidence-toggle'); await sleep(250);
check('mobile: evidence expands', (await count(page, '.theme:not(.is-done) .gw-citation')) > 0);
await page.$eval('.theme:not(.is-done) .theme-actions .btn.v-primary', (e) => e.click()); await sleep(400);
check('mobile: approve updates stats', /1 approved/.test((await text(page, '.queue-stats')) ?? ''));
await page.close();

// about page: R2 + R3 sections
page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(BASE + '/#/about', { waitUntil: 'networkidle0' }); await sleep(400);
const aboutText = (await page.evaluate(() => document.body.innerText)) ?? '';
check('about mentions R2 experiment', /R2: a real, failed model experiment/i.test(aboutText));
check('about mentions R3 live synthesis', /R3\+: live synthesis, on demand/i.test(aboutText));
check('about discloses provider data-use choice', /synthetic/.test(aboutText) && /provider/.test(aboutText));
await page.close();

await browser.close();
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  (' + r.detail + ')' : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);

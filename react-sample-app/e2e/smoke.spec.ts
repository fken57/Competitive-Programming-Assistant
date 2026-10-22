import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test.beforeAll(async ({ request }) => {
  const response = await request.get('/healthz');
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ status: 'ok', database: 'connected' });
});

test('pages support navigation, direct links and reloads', async ({ page, request }) => {
  const failedAssets: string[] = [];
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => {
    if (['script', 'stylesheet'].includes(request.resourceType())) failedAssets.push(request.url());
  });
  page.on('response', response => {
    if (['script', 'stylesheet'].includes(response.request().resourceType()) && response.status() >= 400) {
      failedAssets.push(response.url());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('CPA');
  const navigation = page.getByRole('navigation', { name: 'ページ切替' });
  for (const [label, path, heading] of [
    ['Graph', '/graph', 'Graph Analyzer'],
    ['Array', '/array', 'Array Analyzer'],
    ['Random Gen', '/random-gen', '競技プログラミング入力生成'],
  ]) {
    await navigation.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await navigation.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('CPA');
  await page.goto('/not-a-page');
  await expect(page.getByRole('heading', { name: 'Oops! 404' })).toBeVisible();
  expect((await request.get('/apis/not-a-route')).status()).toBe(404);
  expect((await request.get('/static/not-an-asset.js')).status()).toBe(404);
  expect(failedAssets).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('Array displays the prefix sums returned by the Go API', async ({ page }) => {
  await page.goto('/array');
  await page.getByRole('textbox', { name: '配列の標準入力' }).fill('4\n3 1 2 1');
  await page.getByRole('button', { name: '配列を読み込む' }).click();
  const card = page.locator('section').filter({ has: page.getByRole('heading', { name: '累積和', exact: true }) });
  const responsePromise = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/apis/array/build_prefix_sum' && response.request().method() === 'POST');
  await card.getByRole('button', { name: '実行', exact: true }).click();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({ prefix_sum: [0, 3, 4, 6, 7] });
  await expect(card.locator('pre')).toHaveText('0 3 4 6 7');
});

test('Graph runs BFS through the Go API and draws the result', async ({ page }) => {
  await page.goto('/graph');
  await page.getByRole('textbox', { name: 'グラフの標準入力' }).fill('3 2\n1 2\n2 3');
  await page.getByRole('button', { name: '送信', exact: true }).click();
  const bfs = page.locator('.bfs-algorithm-container');
  await bfs.getByLabel('BFSの開始頂点', { exact: true }).fill('1');
  const responsePromise = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/apis/graphs/unweighted/BFS' && response.request().method() === 'POST');
  await bfs.getByRole('button', { name: 'BFSを実行' }).click();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({ start_vertex: 0, visited_vertices: [0, 1, 2] });
  await expect(bfs.locator('svg')).toBeVisible();
  await expect(bfs.locator('svg .graph-node')).toHaveCount(3);
  await expect(bfs.locator('svg .graph-link')).toHaveCount(2);
  await expect(bfs.locator('svg .graph-node-label')).toHaveText(['1 (d: 0)', '2 (d: 1)', '3 (d: 2)']);
  await expect(bfs.getByText('結果がここに表示されます')).toHaveCount(0);
});

test('Random Gen reproduces a fixed seed through a share URL in a fresh browser context', async ({ page, context, browser }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/random-gen');
  await page.getByLabel('seed', { exact: true }).fill('424242');
  await page.getByLabel('N', { exact: true }).fill('5');
  await page.getByLabel('最小値', { exact: true }).fill('-3');
  await page.getByLabel('最大値', { exact: true }).fill('9');
  const responsePromise = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/apis/random-gen/generate' && response.request().method() === 'POST');
  await page.getByRole('button', { name: '入力を生成' }).click();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const generated = await response.json();
  expect(generated.recipe).toMatchObject({ seed: '424242', params: { N: 5, minValue: -3, maxValue: 9 } });
  expect(generated.inputText).not.toBe('');
  await expect.poll(() => page.locator('.random-gen-output').textContent()).toBe(generated.inputText);
  await page.getByRole('button', { name: 'Copy share URL', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('共有URLをコピーしました');
  const shareURL = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(shareURL).origin).toBe(new URL(page.url()).origin);
  expect(new URL(shareURL).searchParams.has('recipe')).toBeTruthy();

  const sharedContext = await browser.newContext();
  try {
    const sharedPage = await sharedContext.newPage();
    const sharedResponsePromise = sharedPage.waitForResponse(response =>
      new URL(response.url()).pathname === '/apis/random-gen/generate' && response.request().method() === 'POST');
    await sharedPage.goto(shareURL);
    const sharedResponse = await sharedResponsePromise;
    expect(sharedResponse.ok()).toBeTruthy();
    expect(await sharedResponse.json()).toMatchObject({ recipe: generated.recipe, inputText: generated.inputText });
    await expect.poll(() => sharedPage.locator('.random-gen-output').textContent()).toBe(generated.inputText);
  } finally {
    await sharedContext.close();
  }
});

test('registration, reload, logout and login preserve the expected session state', async ({ page, context }) => {
  const username = `e2e_${randomUUID().replace(/-/g, '')}`;
  const password = 'E2e-password-123';
  await page.goto('/');
  const header = page.getByRole('banner');
  await header.getByRole('button', { name: '新規登録', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('ユーザー名', { exact: true }).fill(username);
  await dialog.getByLabel('パスワード', { exact: true }).fill(password);
  await dialog.getByRole('button', { name: '登録してログイン', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(header.getByText(username, { exact: true })).toBeVisible();
  expect((await context.cookies()).find(cookie => cookie.name === 'cpa_session')).toMatchObject({ httpOnly: true, sameSite: 'Lax' });

  await page.reload();
  await expect(header.getByText(username, { exact: true })).toBeVisible();
  await header.getByRole('button', { name: 'ログアウト', exact: true }).click();
  await expect(header.getByRole('button', { name: 'ログイン', exact: true })).toBeVisible();
  expect((await page.request.get('/apis/users/me')).status()).toBe(401);
  await page.reload();
  await expect(header.getByRole('button', { name: 'ログイン', exact: true })).toBeVisible();
  await header.getByRole('button', { name: 'ログイン', exact: true }).click();
  await dialog.getByLabel('ユーザー名', { exact: true }).fill(username);
  await dialog.getByLabel('パスワード', { exact: true }).fill(password);
  await dialog.getByRole('button', { name: 'ログイン', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(header.getByText(username, { exact: true })).toBeVisible();
  const currentUser = await page.request.get('/apis/users/me');
  expect(currentUser.ok()).toBeTruthy();
  expect(await currentUser.json()).toMatchObject({ username });
});

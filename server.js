const express = require('express');
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const cheerio = require('cheerio');

// Import the Math Engine
const { calculateResults } = require('./cgpaCalculator');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const sessionStore = {};
const TARGET_URL = '';

/**
 * STEP 1: Fetch CAPTCHA and keep the browser instance alive
 */
/**
 * STEP 1: Fetch CAPTCHA and keep the browser instance alive
 */
app.get('/api/captcha', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.goto(TARGET_URL.trim(), { waitUntil: 'networkidle2' });

        // FIXED: We are now targeting the actual image tag, not the input box.
        // If '#captchaImage' doesn't work, try 'img[src*="captcha"]' which grabs any image with "captcha" in its source link.
        const captchaImageSelector = '#captchaImage'; 
        
        await page.waitForSelector(captchaImageSelector);
        const captchaElement = await page.$(captchaImageSelector);
        
        const captchaBuffer = await captchaElement.screenshot();
        const captchaBase64 = captchaBuffer.toString('base64');

        const sessionId = crypto.randomUUID();
        sessionStore[sessionId] = { browser, page }; 

        res.json({
            sessionId: sessionId,
            captchaImage: `data:image/png;base64,${captchaBase64}`
        });

    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: 'Failed to fetch Captcha', details: error.message });
    }
});

/**
 * STEP 2: Use the existing live page to fill details, select semester, and submit
 */
app.post('/api/login-and-scrape', async (req, res) => {
    // NOTE: Added 'semester' to the destructured body parameters
    const { enrollmentNumber, password, captchaText, sessionId, semester } = req.body;

    if (!enrollmentNumber || !password || !captchaText || !sessionId) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const session = sessionStore[sessionId];
    if (!session) {
        return res.status(400).json({ error: 'Invalid or expired session ID.' });
    }

    const { browser, page } = session;

    try {
        const usernameSelector = '#username';       
        const passwordSelector = '#passwd';         
        const captchaInputSelector = '#captcha';     
        const loginButtonSelector = 'input[type="submit"]'; 

        // 1. Fill login details
        await page.type(usernameSelector, enrollmentNumber);
        await page.type(passwordSelector, password);
        await page.type(captchaInputSelector, captchaText);

        // 2. Click login and wait for the Dashboard (studenthome.jsp) to load
        await Promise.all([
            page.click(loginButtonSelector),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // 3. NEW WORKFLOW: Handle the Dashboard dropdown and 'GET RESULT' button
        // Wait for the dropdown to appear on the screen
        await page.waitForSelector('select'); 
        
        // Select the requested semester. Fallback to 'ALL' if the client didn't provide one.
        const targetSemester = semester || 'ALL'; 
        await page.select('select', targetSemester);

        // Click the 'GET RESULT' button and wait for the marks table page to load
        // ... (Previous code remains the same up to clicking "GET RESULT") ...

        await Promise.all([
            page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a'));
                const getResultBtn = elements.find(el => (el.textContent || el.value || '').includes('GET RESULT'));
                if (getResultBtn) getResultBtn.click();
            }),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // Capture a clean screenshot of the results table
        const tableElement = await page.$('table'); // Target the main table
        let imageBase64 = null;
        if (tableElement) {
            const imageBuffer = await tableElement.screenshot();
            imageBase64 = imageBuffer.toString('base64');
        }

        // 4. Read the page content containing the results
        const html = await page.content();
        
        // 5. Feed to Cheerio for extraction
        const $ = cheerio.load(html);
        const scrapedData = [];
        
        // Extract based on the actual GGSIPU table structure (8 columns: S.No, Paper Code, Paper Name, Credits, Type, Internal, External, Total)
        $('table tr').each((index, element) => {
            if (index === 0) return; // Skip headers
            const columns = $(element).find('td');
            
            // Ensure row has the expected number of columns (>=8)
            if (columns.length >= 8) {
                scrapedData.push({
                    code: $(columns[1]).text().trim(),
                    name: $(columns[2]).text().trim(),
                    internal: parseInt($(columns[5]).text().trim()) || 0,
                    external: parseInt($(columns[6]).text().trim()) || 0,
                    total: parseInt($(columns[7]).text().trim()) || 0
                });
            }
        });

        // 6. Pass data through the Math Engine
        const finalResult = calculateResults(scrapedData);

        // 7. Return the enriched JSON including the Base64 image
        res.json({
            success: true,
            data: finalResult,
            marksImage: imageBase64 ? `data:image/png;base64,${imageBase64}` : null
        });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during processing', details: error.message });
    } finally {
        // Enforce STRICT browser memory management
        if (sessionStore[sessionId]) {
            if (sessionStore[sessionId].browser) {
                await sessionStore[sessionId].browser.close().catch(e => console.error("Memory management issue: ", e));
            }
            delete sessionStore[sessionId];
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is LIVE! Go to: http://localhost:${PORT}`);
});
    const express = require('express');
    const cors = require('cors');
    const puppeteer = require('puppeteer');
    const crypto = require('crypto');
    const cheerio = require('cheerio');

    // Import the Math Engine
    const { calculateResults } = require('./cgpaCalculator');

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.static('public'));

    const sessionStore = {};
    const TARGET_URL = 'https://examweb.ggsipu.ac.in/web/login.jsp';

    /**
     * STEP 1: Fetch CAPTCHA and keep the browser instance alive
     */
    /**
     * STEP 1: Fetch CAPTCHA and keep the browser instance alive
     */
    app.get('/api/captcha', async (req, res) => {
        let browser;
        try {
            console.log(`[CAPTCHA] Start request. PUPPETEER_CACHE_DIR: ${process.env.PUPPETEER_CACHE_DIR || 'not set'}`);
            console.log(`[CAPTCHA] Launching backend browser...`);
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--no-first-run",
                    "--no-zygote",
                    "--single-process"
                ]
            });
            console.log(`[CAPTCHA] Browser launched successfully.`);

            console.log(`[CAPTCHA] Opening page...`);
            const page = await browser.newPage();
            
            console.log(`[CAPTCHA] Navigating to: ${TARGET_URL.trim()}`);
            await page.goto(TARGET_URL.trim(), { waitUntil: 'networkidle2' });
            console.log(`[CAPTCHA] Navigation successful.`);

            const captchaImageSelector = '#captchaImage'; 
            console.log(`[CAPTCHA] Waiting for selector: ${captchaImageSelector}`);
            await page.waitForSelector(captchaImageSelector, { timeout: 15000 });
            console.log(`[CAPTCHA] Selector found. Obtaining element...`);
            const captchaElement = await page.$(captchaImageSelector);
            
            console.log(`[CAPTCHA] Capturing captcha screenshot...`);
            const captchaBuffer = await captchaElement.screenshot();
            const captchaBase64 = captchaBuffer.toString('base64');
            console.log(`[CAPTCHA] Screenshot captured successfully.`);

            const sessionId = crypto.randomUUID();
            sessionStore[sessionId] = { browser, page }; 
            console.log(`[CAPTCHA] Session saved. ID: ${sessionId}`);

            res.json({
                sessionId: sessionId,
                captchaImage: `data:image/png;base64,${captchaBase64}`
            });

        } catch (error) {
            console.error(`[CAPTCHA ERROR] Failed to fetch captcha:`, error.stack || error.message);
            if (browser) {
                console.log(`[CAPTCHA] Closing browser due to error...`);
                await browser.close().catch(e => console.error(`[CAPTCHA] Error closing browser:`, e));
            }
            res.status(500).json({ error: 'Failed to fetch Captcha', details: error.message });
        }
    });

    /**
     * STEP 2: Use the existing live page to fill details, select semester, and submit
     */
    app.post('/api/login-and-scrape', async (req, res) => {
        const { enrollmentNumber, password, captchaText, sessionId, semester } = req.body;
        console.log(`[SCRAPE] Start login-and-scrape request.`);
        console.log(`[SCRAPE] Parameters: Enrollment: ${enrollmentNumber}, Sem: ${semester || 'ALL'}, Session: ${sessionId}`);

        if (!enrollmentNumber || !password || !captchaText || !sessionId) {
            console.warn(`[SCRAPE] Rejected: Missing required body parameters.`);
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        const session = sessionStore[sessionId];
        if (!session) {
            console.error(`[SCRAPE] Rejected: Session ID ${sessionId} is invalid or expired.`);
            return res.status(400).json({ error: 'Invalid or expired session ID.' });
        }

        const { browser, page } = session;

        try {
            const usernameSelector = '#username';       
            const passwordSelector = '#passwd';         
            const captchaInputSelector = '#captcha';     
            const loginButtonSelector = 'input[type="submit"]'; 

            console.log(`[SCRAPE] Typing user details and captcha...`);
            await page.type(usernameSelector, enrollmentNumber);
            await page.type(passwordSelector, password);
            await page.type(captchaInputSelector, captchaText);

            console.log(`[SCRAPE] Clicking login button and awaiting navigation...`);
            await Promise.all([
                page.click(loginButtonSelector),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
            ]);
            console.log(`[SCRAPE] Login navigation completed.`);

            // --- 1. DIAGNOSTIC DUMP (Run immediately after login networkidle2) ---
            const fs = require('fs');
            
            try {
                console.log(`[SCRAPE] Creating diagnostic dashboard screenshot & HTML files...`);
                await page.screenshot({ path: 'dashboard_diagnostic.png', fullPage: true });

                const selects = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('select')).map(s => ({
                        id: s.id,
                        name: s.name,
                        options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
                    }));
                });
                console.log("\n=== DIAGNOSTIC: DROPDOWNS ===");
                console.log(JSON.stringify(selects, null, 2));

                const buttons = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a')).map(b => ({
                        tag: b.tagName,
                        id: b.id,
                        name: b.name,
                        value: b.value || b.textContent.trim(),
                        className: b.className
                    }));
                });
                console.log("\n=== DIAGNOSTIC: BUTTONS ===");
                console.log(JSON.stringify(buttons, null, 2));

                const rawContent = await page.content();
                fs.writeFileSync('dashboard.html', rawContent);
                console.log("=== HTML Dumped to dashboard.html ===\n");
            } catch (diagErr) {
                console.warn("[SCRAPE] Diagnostic profiling dump failed, continuing...", diagErr.message);
            }

            // --- 2. BULLETPROOF DROPDOWN & FETCH LOGIC ---
            const SEMESTER_DROPDOWN_ID = 'select'; 
            const SUBMIT_BUTTON_ID = 'input[type="submit"]'; 

            const targetSemester = semester || 'ALL'; 
            console.log(`[SCRAPE] Selecting target semester dropdown option: ${targetSemester}`);
            
            await page.waitForSelector(SEMESTER_DROPDOWN_ID, { timeout: 15000 });
            
            await page.evaluate((selector, val) => {
                const selectEl = document.querySelector(selector);
                if (selectEl) {
                    const optionExists = Array.from(selectEl.options).some(opt => opt.value === val);
                    if (optionExists) {
                        selectEl.value = val;
                    } else if (selectEl.options.length > 0) {
                        selectEl.value = selectEl.options[1].value;
                    }
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, SEMESTER_DROPDOWN_ID, targetSemester);
            
            console.log(`[SCRAPE] Waiting 1s postback buffer...`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log(`[SCRAPE] Waiting for submit button: ${SUBMIT_BUTTON_ID}`);
            await page.waitForSelector(SUBMIT_BUTTON_ID, { timeout: 15000 });

            console.log("[SCRAPE] Attempting to click submit button and fetch marks...");
            await Promise.all([
                page.evaluate((selector) => {
                    const btn = document.querySelector(selector);
                    if (btn) btn.click();
                }, SUBMIT_BUTTON_ID),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => console.log('[SCRAPE] Navigation wait resolved or timed out (AJAX redraw detected).'))
            ]);

            console.log(`[SCRAPE] Waiting for result marks tables to render...`);
            await page.waitForSelector('table', { timeout: 15000 }).catch(() => console.warn("[SCRAPE] Warning: No result table found immediately."));

            let imageBase64 = null;
            try {
                console.log(`[SCRAPE] Capturing marks screenshot...`);
                const imageBuffer = await page.screenshot({ fullPage: true });
                imageBase64 = imageBuffer.toString('base64');
                console.log(`[SCRAPE] Marks screenshot successful.`);
            } catch (err) {
                console.error('[SCRAPE ERROR] Screenshot failed:', err.message);
            }

            // --- 3. ADVANCED TABLE SCRAPING (Cheerio) ---
            console.log(`[SCRAPE] Parsing HTML using Cheerio...`);
            const finalHtml = await page.content();
            const $ = cheerio.load(finalHtml);
            const scrapedData = [];
            
            const studentProfile = { name: "N/A", enrollment: "N/A", admissionYear: "N/A", institute: "N/A", program: "N/A" };
            
            $('td, th, span').each((i, el) => {
                const rawText = $(el).text();
                const text = rawText.trim().toLowerCase();
                const nextText = $(el).next().text().trim();
                
                const extractValue = (label) => {
                    if (text.includes(label)) {
                        if (rawText.includes(':')) {
                            const parts = rawText.split(':');
                            if (parts.length > 1 && parts[1].trim() !== '') return parts[1].trim();
                        }
                        if (nextText) return nextText;
                    }
                    return null;
                }

                if (extractValue('student name') || extractValue('name of the student')) studentProfile.name = extractValue('student name') || extractValue('name of the student');
                if (extractValue('enrollment no')) studentProfile.enrollment = extractValue('enrollment no');
                if (extractValue('admission year') || extractValue('batch')) studentProfile.admissionYear = extractValue('admission year') || extractValue('batch');
                if (extractValue('institution') || extractValue('institute')) studentProfile.institute = extractValue('institution') || extractValue('institute');
                if (extractValue('programme') || extractValue('program name')) studentProfile.program = extractValue('programme') || extractValue('program name');
            });
            console.log(`[SCRAPE] Extracted Profile: ${JSON.stringify(studentProfile)}`);

            $('table tr').each((index, element) => {
                const columns = $(element).find('td, th');
                
                if (columns.length >= 6) {
                    const rowText = $(element).text().toLowerCase();
                    if (rowText.includes('paper name') || rowText.includes('sr. no')) return; 

                    const code = $(columns[1]).text().trim();
                    const name = $(columns[2]).text().trim();
                    
                    if (!code || code === '') return;

                    scrapedData.push({
                        code: code,
                        name: name,
                        internal: $(columns[3]).text().trim(), 
                        external: $(columns[4]).text().trim(), 
                        total: $(columns[5]).text().trim()     
                    });
                }
            });

            console.log(`[SCRAPE] Cheerio scraped subjects: ${scrapedData.length}`);

            console.log(`[SCRAPE] Running Math calculation engine...`);
            const finalResult = calculateResults(scrapedData);

            console.log(`[SCRAPE] Result successfully calculated. Returning response.`);
            res.json({
                success: true,
                studentProfile: studentProfile,
                data: finalResult,
                marksImage: imageBase64 ? `data:image/png;base64,${imageBase64}` : null
            });

        } catch (error) {
            console.error(`[SCRAPE ERROR] Pipeline Execution Failed:`, error.stack || error.message);
            res.status(500).json({ error: 'An error occurred during processing', details: error.message });
        } finally {
            if (sessionStore[sessionId]) {
                console.log(`[SCRAPE] Performing memory cleanup and closing session browser...`);
                if (sessionStore[sessionId].browser) {
                    await sessionStore[sessionId].browser.close().catch(e => console.error("[SCRAPE] Memory close helper error: ", e));
                }
                delete sessionStore[sessionId];
                console.log(`[SCRAPE] Session store cleaned.`);
            }
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is LIVE! Go to: http://localhost:${PORT}`);
    });
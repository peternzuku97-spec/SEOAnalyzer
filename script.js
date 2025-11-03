document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GET ALL OUR HTML ELEMENTS ---
    const titleInput = document.getElementById('page-title');
    const keywordInput = document.getElementById('focus-keyword');
    const metaInput = document.getElementById('meta-description');
    const contentInput = document.getElementById('main-content');
    const analyzeButton = document.getElementById('analyze-button');
    const resultsList = document.getElementById('results-list');
    const metaCounter = document.getElementById('meta-counter');
    const contentCounter = document.getElementById('content-counter');

    // --- 2. ADD LIVE COUNTERS ---
    metaInput.addEventListener('input', () => {
        const length = metaInput.value.length;
        metaCounter.textContent = `${length} / 160`;
        metaCounter.style.color = length > 160 ? '#f44336' : '#999';
    });

    contentInput.addEventListener('input', () => {
        // To count words, we strip the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentInput.value;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        contentCounter.textContent = `${wordCount} words`;
    });

    // --- 3. THE "ANALYZE" BUTTON CLICK ---
    analyzeButton.addEventListener('click', () => {
        resultsList.innerHTML = ''; // Clear old results

        // Get all values
        const title = titleInput.value;
        const keyword = keywordInput.value.toLowerCase().trim();
        const metaDescription = metaInput.value;
        const htmlContent = contentInput.value;

        // --- This is the magic! ---
        // We create a temporary, invisible element in the browser's memory
        // and put the user's HTML into it.
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // This gives us the text *without* HTML tags
        const textContent = doc.body.textContent || '';
        const wordCount = textContent.trim() === '' ? 0 : textContent.trim().split(/\s+/).length;

        // --- RUN ALL OUR NEW, DETAILED CHECKS ---
        checkTitle(title, keyword);
        checkMetaDescription(metaDescription, keyword);
        checkWordCount(wordCount);
        checkKeywordDensity(textContent, keyword, wordCount);
        checkKeywordInFirstParagraph(doc, keyword);
        checkHeadings(doc, keyword);
        checkLinks(doc);
        checkImages(doc);
    });

    // --- 4. HELPER FUNCTIONS (Our "Checklist") ---

    /**
     * Helper function to add a new recommendation to the results list.
     * @param {string} text - The recommendation text to display.
     * @param {'good' | 'bad' | 'info'} type - The style of the recommendation.
     */
    function addRecommendation(text, type) {
        const listItem = document.createElement('li');
        listItem.innerHTML = text; // Use innerHTML to allow simple tags like <strong>
        listItem.className = `recommendation ${type}`;
        resultsList.appendChild(listItem);
    }

    // CHECK 1: Page Title
    function checkTitle(title, keyword) {
        if (!title) {
            addRecommendation('🔴 <strong>Page Title:</strong> You are missing a page title (H1). This is a critical SEO element.', 'bad');
            return;
        }
        if (title.length < 30 || title.length > 60) {
            addRecommendation(`🔴 <strong>Page Title:</strong> Your title is ${title.length} characters. Aim for 30-60 characters.`, 'bad');
        } else {
            addRecommendation('🟢 <strong>Page Title:</strong> Your title length is good.', 'good');
        }
        if (keyword && title.toLowerCase().includes(keyword)) {
            addRecommendation('🟢 <strong>Page Title:</strong> Your focus keyword is in the title. Great!', 'good');
        } else if (keyword) {
            addRecommendation('🔴 <strong>Page Title:</strong> Your focus keyword was not found in the title. Try to add it near the beginning.', 'bad');
        }
    }

    // CHECK 2: Meta Description (Updated with keyword check)
    function checkMetaDescription(meta, keyword) {
        if (!meta) {
            addRecommendation('🔴 <strong>Meta Description:</strong> You are missing a meta description.', 'bad');
            return;
        }
        if (meta.length > 160 || meta.length < 50) {
            addRecommendation(`🔴 <strong>Meta Description:</strong> Length is ${meta.length} characters. Aim for 50-160.`, 'bad');
        } else {
            addRecommendation('🟢 <strong>Meta Description:</strong> Length is perfect.', 'good');
        }
        if (keyword && meta.toLowerCase().includes(keyword)) {
            addRecommendation('🟢 <strong>Meta Description:</strong> Your focus keyword is in the meta description.', 'good');
        } else if (keyword) {
            addRecommendation('🔴 <strong>Meta Description:</strong> Your focus keyword is not in your meta description.', 'bad');
        }
    }

    // CHECK 3: Word Count
    function checkWordCount(wordCount) {
        if (wordCount < 300) {
            addRecommendation(`🔴 <strong>Word Count:</strong> ${wordCount} words. This is short. Aim for 300+ words.`, 'bad');
        } else {
            addRecommendation(`🟢 <strong>Word Count:</strong> ${wordCount} words. Good length!`, 'good');
        }
    }

    // CHECK 4: Keyword Density
    function checkKeywordDensity(textContent, keyword, wordCount) {
        if (!keyword) {
            addRecommendation('⚪ <strong>Focus Keyword:</strong> You have not set a focus keyword.', 'info');
            return;
        }
        
        const keywordCount = (textContent.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
        const density = (keywordCount / wordCount * 100).toFixed(2);

        if (density > 2.5) {
            addRecommendation(`🔴 <strong>Keyword Density:</strong> ${density}%. This is too high (keyword stuffing). Try to reduce it.`, 'bad');
        } else if (density < 0.5) {
            addRecommendation(`⚪ <strong>Keyword Density:</strong> ${density}%. This is low. Try to include the keyword a few more times naturally.`, 'info');
        } else {
            addRecommendation(`🟢 <strong>Keyword Density:</strong> ${density}%. This is a good density.`, 'good');
        }
    }

    // CHECK 5: Keyword in First Paragraph
    function checkKeywordInFirstParagraph(doc, keyword) {
        if (!keyword) return;
        const firstParagraph = doc.querySelector('p');
        if (firstParagraph && firstParagraph.textContent.toLowerCase().includes(keyword)) {
            addRecommendation('🟢 <strong>Content:</strong> Your focus keyword appears in the first paragraph. Excellent!', 'good');
        } else {
            addRecommendation('🔴 <strong>Content:</strong> Your focus keyword was not found in the first paragraph. Try to add it.', 'bad');
        }
    }

    // CHECK 6: Subheadings (H2, H3)
    function checkHeadings(doc, keyword) {
        const headings = doc.querySelectorAll('h2, h3, h4');
        if (headings.length === 0) {
            addRecommendation('🔴 <strong>Headings:</strong> Your content has no subheadings (H2, H3, etc.). Use them to structure your content.', 'bad');
            return;
        }

        let keywordInHeading = false;
        headings.forEach(h => {
            if (keyword && h.textContent.toLowerCase().includes(keyword)) {
                keywordInHeading = true;
            }
        });

        addRecommendation(`🟢 <strong>Headings:</strong> You have ${headings.length} subheadings. This is great for structure.`, 'good');
        if (keyword && keywordInHeading) {
            addRecommendation('🟢 <strong>Headings:</strong> Your focus keyword is in at least one subheading. Perfect!', 'good');
        } else if (keyword) {
            addRecommendation('⚪ <strong>Headings:</strong> Your focus keyword was not found in any subheadings. Consider adding it to one.', 'info');
        }
    }

    // CHECK 7: Links
    function checkLinks(doc) {
        const links = doc.querySelectorAll('a');
        let externalLinks = 0;
        let internalLinks = 0;

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                if (href.startsWith('http://') || href.startsWith('https://')) {
                    externalLinks++;
                } else if (href.startsWith('/') || href.startsWith('#')) {
                    internalLinks++;
                }
            }
        });

        if (externalLinks === 0) {
            addRecommendation('⚪ <strong>Outbound Links:</strong> You have no outbound links. Try linking to other high-authority websites.', 'info');
        } else {
            addRecommendation(`🟢 <strong>Outbound Links:</strong> You have ${externalLinks} outbound link(s).`, 'good');
        }

        if (internalLinks === 0) {
            addRecommendation('🔴 <strong>Internal Links:</strong> You have no internal links. Link to other pages on your own site.', 'bad');
        } else {
            addRecommendation(`🟢 <strong>Internal Links:</strong> You have ${internalLinks} internal link(s).`, 'good');
        }
    }

    // CHECK 8: Image Alt Tags
    function checkImages(doc) {
        const images = doc.querySelectorAll('img');
        if (images.length === 0) {
            addRecommendation('⚪ <strong>Images:</strong> Your content doesn\'t seem to have any images. Consider adding some.', 'info');
            return;
        }

        let missingAltTags = 0;
        images.forEach(img => {
            const alt = img.getAttribute('alt');
            if (!alt || alt.trim() === '') {
                missingAltTags++;
            }
        });

        if (missingAltTags > 0) {
            addRecommendation(`🔴 <strong>Image SEO:</strong> You have ${missingAltTags} image(s) missing an 'alt' tag. Add descriptive alt tags to all images.`, 'bad');
        } else {
            addRecommendation(`🟢 <strong>Image SEO:</strong> All ${images.length} image(s) have alt tags. Well done!`, 'good');
        }
    }

});

// --- 5. GOOGLE PAGESPEED API LOGIC ---

// Get the new HTML elements
const urlInput = document.getElementById('page-url');
const analyzeUrlButton = document.getElementById('analyze-url-button');
const urlResultsList = document.getElementById('url-results-list');
const loadingSpinner = document.getElementById('loading-spinner');

// !! IMPORTANT: PASTE YOUR API KEY HERE
const API_KEY = 'AIzaSyDshJnT37S42gUYfbuwHA9CpbXS6q54AMQ';

// Add click listener for the new button
analyzeUrlButton.addEventListener('click', () => {
    const url = urlInput.value;

    if (!url) {
        alert('Please enter a URL to analyze.');
        return;
    }

    // Clear old results and show spinner
    urlResultsList.innerHTML = '';
    loadingSpinner.classList.remove('hidden');
    analyzeUrlButton.disabled = true; // Disable button during load

    // Construct the API URL
    // We are asking for 'DESKTOP' strategy and only the 'seo' category
    // New line: Request all three categories (Performance, Accessibility, SEO)
const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=DESKTOP&category=PERFORMANCE&category=ACCESSIBILITY&category=SEO`;

    // Make the API call
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Hide spinner and re-enable button
            loadingSpinner.classList.add('hidden');
            analyzeUrlButton.disabled = false;

            if (data.error) {
                // Show an error if Google sends one
                addUrlRecommendation(`Error: ${data.error.message}`, 'bad');
                return;
            }
            
            // --- Process the Google data! ---
            processApiData(data);
        
        })
        .catch(error => {
            // Handle network errors
            loadingSpinner.classList.add('hidden');
            analyzeUrlButton.disabled = false;
            addUrlRecommendation(`Network Error: ${error.message}`, 'bad');
        });
});
/**
 * This function processes the massive JSON from Google
 * and pulls out the interesting bits, including CWV and Performance.
 */
function processApiData(data) {
    urlResultsList.innerHTML = ''; // Clear old URL results

    const lighthouseResult = data.lighthouseResult;
    const audits = lighthouseResult.audits;
    
    // --- Helper for safe category retrieval ---
    const getCategory = (id) => lighthouseResult.categories[id];
    
    // --- 1. CORE WEB VITALS & PERFORMANCE ---
    const performanceCategory = getCategory('performance');
    if (performanceCategory) {
        const performanceScore = performanceCategory.score * 100;
        addScoreCard('Performance Score', performanceScore);
        addUrlRecommendation('🟢 **Core Web Vitals Check**', 'good');
        
        // Ensure metrics exist before reading them
        const metrics = audits['metrics'] && audits['metrics'].details && audits['metrics'].details.items && audits['metrics'].details.items[0];

        if (metrics) {
            // Largest Contentful Paint (LCP)
            const lcp = metrics.largestContentfulPaint;
            const lcpRating = lcp <= 2500 ? 'Good' : (lcp <= 4000 ? 'Needs Improvement' : 'Poor');
            const lcpType = lcp <= 2500 ? 'good' : (lcp <= 4000 ? 'info' : 'bad');
            addUrlRecommendation(`⚪ **LCP:** ${lcpRating} (${(lcp / 1000).toFixed(2)}s). Aim for < 2.5s.`, lcpType);

            // Cumulative Layout Shift (CLS)
            const cls = metrics.cumulativeLayoutShift;
            const clsRating = cls <= 0.1 ? 'Good' : (cls <= 0.25 ? 'Needs Improvement' : 'Poor');
            const clsType = cls <= 0.1 ? 'good' : (cls <= 0.25 ? 'info' : 'bad');
            addUrlRecommendation(`⚪ **CLS:** ${clsRating} (${cls.toFixed(3)}). Aim for < 0.1.`, clsType);

            // Total Blocking Time (TBT)
            const tbt = metrics.totalBlockingTime;
            const tbtRating = tbt <= 200 ? 'Good (Low Blocking Time)' : 'Poor (High Blocking Time)';
            const tbtType = tbt <= 200 ? 'good' : 'bad';
            addUrlRecommendation(`⚪ **TBT (Proxy for INP):** ${tbtRating} (${tbt.toFixed(0)}ms). Aim for < 200ms.`, tbtType);
        }
    } else {
        addUrlRecommendation('🔴 **Performance Data Missing:** Could not retrieve Core Web Vitals data for this URL.', 'bad');
    }

    // --- 2. ACCESSIBILITY SCORE ---
    const accessibilityCategory = getCategory('accessibility');
    if (accessibilityCategory) {
        const accessibilityScore = accessibilityCategory.score * 100;
        addScoreCard('Accessibility Score', accessibilityScore);
        
        if (accessibilityScore < 90) {
            addUrlRecommendation('🔴 **Accessibility:** Low score! Check for issues like color contrast or form labels.', 'bad');
        } else {
            addUrlRecommendation('🟢 **Accessibility:** Excellent score!', 'good');
        }
    }

    // --- 3. SEO SCORE & Detailed Technical Checks ---
    const seoCategory = getCategory('seo');
    if (seoCategory) {
        const seoScore = seoCategory.score * 100;
        addScoreCard('Google SEO Score', seoScore);

        // Meta Description Check
        if (audits['meta-description'] && audits['meta-description'].score === 0) {
            addUrlRecommendation('🔴 **Meta Description:** Page is missing one, or it is too short.', 'bad');
        } else if (audits['meta-description']) {
            addUrlRecommendation('🟢 **Meta Description:** Page has a suitable meta description.', 'good');
        }

        // Image Alt text check
        if (audits['image-alt'] && audits['image-alt'].score < 1) {
            addUrlRecommendation('🔴 **Image SEO:** Some images are missing an `alt` tag.', 'bad');
        } else if (audits['image-alt']) {
            addUrlRecommendation('🟢 **Image SEO:** All images have alt tags.', 'good');
        }

        // Check if the page is blocked from indexing (Crucial for ranking)
        if (audits['is-crawlable'] && audits['is-crawlable'].score < 1) {
            addUrlRecommendation('🔴 **Indexing:** The page may be blocked from indexing. **Fix this immediately.**', 'bad');
        } else if (audits['is-crawlable']) {
            addUrlRecommendation('🟢 **Indexing:** The page is not blocked from indexing.', 'good');
        }

        // Check for mobile-friendly viewport (A key ranking factor)
        if (audits['viewport'] && audits['viewport'].score === 0) {
            addUrlRecommendation('🔴 **Mobile Viewport:** Missing `<meta name="viewport">` tag. **The page is not mobile-friendly.**', 'bad');
        } else if (audits['viewport']) {
            addUrlRecommendation('🟢 **Mobile Viewport:** Page uses a mobile-friendly viewport.', 'good');
        }
    } else {
        addUrlRecommendation('🔴 **SEO Audit Missing:** Could not retrieve full SEO audit for this URL.', 'bad');
    }
}
/**
 * Helper to add a recommendation to the NEW URL results list
 */
function addUrlRecommendation(text, type) {
    const listItem = document.createElement('div'); // Use div instead of li
    listItem.innerHTML = text;
    listItem.className = `recommendation ${type}`;
    urlResultsList.appendChild(listItem);
}

/**
 * Helper to create the big score card
 */
function addScoreCard(title, score) {
    let scoreColor = '#f44336'; // Red
    if (score >= 50) scoreColor = '#ffa726'; // Orange
    if (score >= 90) scoreColor = '#4CAF50'; // Green

    const card = document.createElement('div');
    card.className = 'score-card';
    card.innerHTML = `
        <h3>${title}</h3>
        <div class="score-value" style="color: ${scoreColor};">${score.toFixed(0)}</div>
    `;
    urlResultsList.appendChild(card);

}

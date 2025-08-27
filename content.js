// Main listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "clipSelection":
            handleClipSelection();
            break;
        case "clipSimplify":
            handleClipSimplify();
            break;
        case "clipBookmark":
            handleClipBookmark();
            break;
    }
});

// --- Action Handlers ---

function handleClipSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const tempContainer = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
        tempContainer.appendChild(selection.getRangeAt(i).cloneContents());
    }
    const selectedMarkdown = turndownService.turndown(tempContainer.innerHTML).trim();

    if (!selectedMarkdown) return;
    const finalClip = formatClip(selectedMarkdown);
    copyToClipboard(finalClip, "Selection");
}

function handleClipSimplify() {
    const documentClone = document.cloneNode(true);
    const article = new Readability(documentClone).parse();
    
    if (!article || !article.content) {
        showVertextNotification("❌ Error: Could not find an article to simplify.");
        return;
    }

    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const markdown = turndownService.turndown(article.content).trim();
    const finalClip = formatClip(markdown, article.title);
    copyToClipboard(finalClip, "Simplified Page");
}

function handleClipBookmark() {
    const markdownLink = `[${document.title}](${window.location.href})`;
    const finalClip = formatClip(markdownLink);
    copyToClipboard(finalClip, "Bookmark");
}

// --- Helper Functions ---

function formatClip(content, title = document.title) {
    const sourceURL = window.location.href;
    const clipDate = new Date().toLocaleDateString("en-US");
    
    return `> Clipped from: [${title}](${sourceURL})\n` +
           `> Date: ${clipDate}\n\n` +
           `${content}`;
}

function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log(`Vertext Capture: ${type} successfully copied.`); // Updated console log
            showVertextNotification(`✅ ${type} Captured!`); // ✨ UPDATED LINE ✨
        })
        .catch(err => {
            console.error(`Vertext Capture: Failed to copy ${type}. `, err);
            showVertextNotification("❌ Error: Could not copy to clipboard.");
        });
}

function showVertextNotification(message) {
    const notification = document.createElement('div');
    notification.innerText = message;
    
    Object.assign(notification.style, {
        position: 'fixed', top: '20px', right: '20px', padding: '12px 20px',
        backgroundColor: '#212529', color: '#e3e3e3', borderRadius: '8px',
        zIndex: '999999', fontSize: '16px', fontFamily: 'sans-serif',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)', opacity: '0',
        transition: 'opacity 0.3s ease-in-out'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => { notification.style.opacity = '1'; }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => { if (document.body.contains(notification)) { document.body.removeChild(notification); } }, 300);
    }, 2500);
}
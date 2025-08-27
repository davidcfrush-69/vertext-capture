// Create the context menu items when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  // Use "Capture" instead of "Clip" for a consistent brand voice
  chrome.contextMenus.create({ id: "vertext-clip-selection", title: "Capture Selection", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "vertext-clip-simplify", title: "Capture Simplified Page", contexts: ["page"] });
  chrome.contextMenus.create({ id: "vertext-clip-bookmark", title: "Capture as Bookmark", contexts: ["page"] });
});

// Listener for all context menu clicks.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const actionMap = {
    "vertext-clip-selection": "clipSelection",
    "vertext-clip-simplify": "clipSimplify",
    "vertext-clip-bookmark": "clipBookmark"
  };

  const message = actionMap[info.menuItemId];
  if (message) {
    chrome.tabs.sendMessage(tab.id, { action: message });
  }
});

// Listener for the keyboard shortcut.
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "clip-selection") {
    chrome.tabs.sendMessage(tab.id, { action: "clipSelection" });
  }
});
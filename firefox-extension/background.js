browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url.includes("ignitiaschools.com")) {
        browser.tabs.executeScript(details.tabId, { file: "IgnitiaPlus.js" });
    }
});

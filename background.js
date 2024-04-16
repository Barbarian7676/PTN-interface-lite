chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ api_key: "", server_url: "" });
    console.log('Default settings saved');
  });



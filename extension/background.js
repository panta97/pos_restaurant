// console.log('background running');

// chrome.browserAction.onClicked.addListener(buttonClicked)

// function buttonClicked(tab) {
//   let msg = {
//     command: 'nextGen'
//   }
//   chrome.tabs.sendMessage(tab.id, msg);
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.package) {
    fetch("http://localhost:8000/print-order", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.package),
    });
  }
});

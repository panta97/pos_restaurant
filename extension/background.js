// console.log('background running');

// chrome.browserAction.onClicked.addListener(buttonClicked)

// function buttonClicked(tab) {
//   let msg = {
//     command: 'nextGen'
//   }
//   chrome.tabs.sendMessage(tab.id, msg);
// }

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.package) {
    const response = await fetch("http://localhost:8000/print-order", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.package),
    });
    const jsonObj = await response.json();
    chrome.tabs.sendMessage(sender.tab.id, {
      msj: jsonObj.msj,
      statusCode: response.status,
    });
  }
});

// Content script scraping LinkedIn/Dice candidate profile details
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_profile") {
    const nameEl = document.querySelector("h1.text-heading-xlarge") || document.querySelector("h1");
    const titleEl = document.querySelector(".text-body-medium.break-words") || document.querySelector(".title");
    
    sendResponse({
      name: nameEl ? nameEl.innerText.trim() : "",
      title: titleEl ? titleEl.innerText.trim() : "",
      url: window.location.href
    });
  }
});

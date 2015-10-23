chrome.contextMenus.create({
    title: 'Fly Here',
    onclick: FlyHereClick,
    contexts: ['selection']
}, function () {
    if (chrome.extension.lastError) {
        console.log('Got expected error: ' + chrome.extension.lastError.message);
    }
});


var FlyHereClick = function (info, tab) {
    console.log(info);
    //var selectionText = info.selectionText;
  
};
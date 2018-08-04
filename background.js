//background script
'use strict';

//includes listening event with sets up value using storage API to allow multiple extension
//components to access that value and update it
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log('The color is green.');
  });

//adds declared rules with declarativeContent API
//https://developer.chrome.com/extensions/declarativeContent
//only runs the chrome extensions if on chrome developer page
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'www.setlist.fm', pathContains: 'setlist'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

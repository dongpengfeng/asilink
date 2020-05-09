// Hidden dom to detect if the flowMask exists
var flowDom = document.createElement('div')
flowDom.setAttribute('id', 'flowmask_extension_dom')
flowDom.style.display = 'none'
document.body.appendChild(flowDom)

// Listen to web postMessage event
window.addEventListener('message', function (event) {

  if (event.source != window)
    return;
  if (event.data.type) {
    switch (event.data.type) {
      case 'GET_FlowMask_Address':
      case 'GET_FlowMask_DeployContract':
      case 'GET_ContractSend':
      case 'GET_Signature':
      case 'WATCH_FLOWMASK_LOGIN_OUT':
      case 'GET_ContractRead':
      case 'GET_SignTransaction':
        SendToBackground(event.data);
        break;
      default:
        break
    }
  }
}, false)

// Send to background.js
function SendToBackground(data) {
  chrome.runtime.sendMessage(data)
}

// Listen to background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case 'POST_FlowMask_Address':
    case 'POST_FlowMask_DeployContract':
    case 'POST_CheckCloseEvent':
    case 'POST_Signature':
    case 'POST_SignTransaction':
    case 'HAD_FLOWMASK_LOGIN_OUT':
      window.postMessage(request, '*');
      SendToBackground({
        type: 'CLOSE_MODAL'
      })
      sendResponse('done')
      break;
    case 'POST_ContractSend':
      window.postMessage(request, '*');
      break;
  }
})
import NotificationManager from './notificationManager';
const extension = require('extensionizer')
import * as md5 from "md5";
import Storage from '@service/storage';
import Authorization from "@service/authorization";
import Cfg from '@/cfg'
import { getWalletPubKey } from '@utils'
import { chain } from '@api/chain';
import Cache from "@service/cache";
import { CONSTANT } from "@/constant";
import { PublicKey } from "@asimovdev/asimovjs";

let notificationManager = new NotificationManager();
const authorization = new Authorization();

function openPopup(route, queryParams) {

    let width, height;
    switch (route) {
        case 'author-address':
        case 'author-signature':
            width = 416;
            height = 250;
            break;
        case 'author-contract-send':
            width = 480;
            height = 617;
            break;
        default:
            width = 780;
            height = 600;
    }
    extension.tabs.query({
        active: true
    }, tabs => {
        notificationManager.showPopup(route, queryParams, width, height)
    })
}

chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        var matcher;
        if (Cfg.activeURL == '*') {
            matcher = {
                pageUrl: {
                    urlContains: '/'
                }
            }
        } else {
            matcher = {
                pageUrl: {
                    hostEquals: Cfg.activeURL,
                    schemes: ['https']
                }
            }
        }
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher(matcher)
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

// Send to content.js
function SendToContent(tabId, data) {

    chrome.tabs.sendMessage(tabId, data, function (response) {
        if (response == 'done') {
            notificationManager.closePopup();
        }
    });
}

let contentTabId, warnLoginTabId = new Set();

async function validate(type, tabId) {
    let walletInfo = await Storage.get("walletInfo");
    let logStatus = await Storage.get("walletLogStatus");
    let msgType = type.replace(/(GET_)/, "POST_");
    if (!walletInfo || ((typeof walletInfo == 'object') && JSON.stringify(walletInfo) == '{}')) {
        return false;
    } else {
        if (logStatus == true) {
            return false;
        }
    }
    return true
}

// Listen to content.js
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    let type = request.type;
    let data = request.data || {};
    let id = request.id;

    if (data.net) {
        let net = CONSTANT.NETWORKS;
        net = net.concat(Cache.getCustomNetwork());
        for (let netObj of net) {
            if (netObj.value === data.net) {
                Cache.setNetwork(netObj);
                break;
            }
        }
    }

    let net = Cache.getNetwork().value;

    if (/^(GET_)/.test(type)) {
        contentTabId = sender.tab.id;
        let isValidate = await validate(type, contentTabId)

        if (!isValidate) {
            data.login = false;
            sendResponse({
                type: 'error',
                message: 'validate error'
            });

            openPopup('/', {});
            return;
        }
    }

    switch (request.type) {
        case 'GET_FlowMask_Address':
            const licensor = await authorization.getLicensor(md5(data.fromName));
            if (!licensor) {
                openPopup('author-address', {
                    data: {
                        licensorId: md5(data.fromName),
                        fromName: data.fromName
                    },
                    id: id
                });
            } else {
                const publicKey = await getWalletPubKey();
                const mappingAddress = new PublicKey(publicKey).toAddress().toString();
                SendToContent(contentTabId, {
                    type: "POST_FlowMask_Address",
                    id: id,
                    result: {
                        success: true,
                        msg: "",
                        data: {
                            address: licensor.address,
                            mappingAddress
                        },
                        net
                    }
                })
            }
            break;
        case 'GET_ContractSend':
            openPopup('author-contract-send', {
                data: { data, id },
            });
            break;
        case 'GET_Signature':
        case 'GET_SignTransaction':
            openPopup('author-signature', { data: { data: request } })
            break;
        case 'GET_ContractRead':
            const { callerAddress, contractAddress, name, abi } = data;
            let result = await chain.callreadonlyfunction(callerAddress, contractAddress, data.data, name, abi)
            SendToContent(sender.tab.id, {
                type: "POST_ContractRead",
                result: {
                    success: true,
                    data: result
                }
            });
            break;
        case 'WATCH_FLOWMASK_LOGIN_OUT':
            warnLoginTabId.add(sender.tab.id);
            Storage.get("walletLogStatus").then(logStatus => {
                if (logStatus) {
                    SendToContent(sender.tab.id, {
                        type: "HAD_FLOWMASK_LOGIN_OUT",
                        result: {
                            success: true
                        },
                        net
                    });
                }
            });
            break;
        case 'POST_FlowMask_Address':
        case 'POST_FlowMask_DeployContract':
        case 'POST_ContractSend':
        case 'POST_CheckCloseEvent':
        case 'POST_Signature':
        case 'POST_SignTransaction':
            if (contentTabId) {
                SendToContent(contentTabId, request);
            }
            break;
        case 'HAD_FLOWMASK_LOGIN_OUT':
            if (warnLoginTabId) {
                for (let id of warnLoginTabId) {
                    try {
                        SendToContent(id, request);
                    } catch (e) {
                        warnLoginTabId.remove(id);
                    }
                }
            }
            break;
        case 'CLOSE_MODAL':
            notificationManager.closePopup();
            break;
    }
    sendResponse({
        type: 'done'
    });
    return false;
});

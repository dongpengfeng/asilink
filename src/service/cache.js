/**
 * Cache store unimportant information
 */
import { CONSTANT } from '@/constant'

function get(key) {
	let data = localStorage.getItem(key)
	try {
		data = JSON.parse(data)
	} catch (e) { }
	return data
}

function set(key, data) {
	let tmpl_data = {}
	tmpl_data[key] = data
	if (typeof data == 'object') {
		data = JSON.stringify(data)
	}
	localStorage.setItem(key, data)
}

function remove(key) {
	localStorage.removeItem(key)
}

function clear() {
	localStorage.clear()
}


export default {
	getNetwork() {
		return get('network') || CONSTANT.DEFAULT_NETWORK;
	},
	setNetwork(value) {
		return set('network', value);
	},
	removeNetwork() {
		return remove('network');
	},
	getCustomNetwork() {
		return get('customNetwork') || [];
	},
	setCustomNetwork(value) {
		return set('customNetwork', value);
	},
	removeCustomNetwork() {
		return remove('customNetwork');
	},
	getAssetInfo() {
		return get('assetInfoes') || {};
	},
	setAssetInfo(value) {
		return set('assetInfoes', value);
	},
	removeAssetInfo(k) {
		return remove('assetInfoes')
	},
	getTransCache(wltInst, asset) {
		let allTransCache = get("transCache") || {};
		let wltTransCache = allTransCache[wltInst] || {};
		if (asset) {
			let assetTransCache = wltTransCache[asset] || [];
			return assetTransCache
		} else {
			return wltTransCache
		}
	},
	setTransCache(wltInst, asset, value) {
		let allTransCache = get("transCache") || {};
		if (!allTransCache[wltInst]) {
			allTransCache[wltInst] = {};
		}
		if (!allTransCache[wltInst][asset]) {
			allTransCache[wltInst][asset] = [];
		}
		allTransCache[wltInst][asset].unshift(value);
		set('transCache', allTransCache);
	},
	removeTransCache(wltInst, asset, txid) {
		let allTransCache = get("transCache") || {};
		if (allTransCache[wltInst] && allTransCache[wltInst][asset]) {
			for (let i = 0; i < allTransCache[wltInst][asset].length; i++) {
				if (allTransCache[wltInst][asset][i].tranBaseInfo.txid === txid) {
					allTransCache[wltInst][asset].splice(i, 1);
					if (allTransCache[wltInst][asset].length === 0) {
						delete allTransCache[wltInst][asset]
					}
					set('transCache', allTransCache);
					break;
				}
			}
		}
	},
	clearTransCache(wltInst) {
		let allTransCache = get("transCache") || {};
		if (allTransCache[wltInst]) {
			delete allTransCache[wltInst];
			set('transCache', allTransCache);
		}
	},
	getTranPanelToggle() {
		return get('tranPanelToggle') || false;
	},
	setTranPanelToggle(state) {
		set('tranPanelToggle', state);
	},
	getSelectIcon() {
		return get('selectIcon') || CONSTANT.DEFAULT_ASSET;
	},
	setSelectIcon(assetCode) {
		set('selectIcon', assetCode);
	},
	getAssetsInfo() {
		return get('getAssetsInfo') || [];
	},
	setAssetsInfo(assetsInfo) {
		set('getAssetsInfo', assetsInfo);
	},
	getCurrency() {
		return get('currency') || CONSTANT.DEFAULT_CURRENCY;
	},
	setCurrency(currency) {
		return set('currency', currency);
	}
}
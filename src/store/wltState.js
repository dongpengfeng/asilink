import { chain } from '@api/chain';
import Wallets from "@service/wallets";
import { TranService } from "@service/transaction";
import Storage from "@service/storage";
import Cache from "@service/cache";
import { CONSTANT } from '@/constant'
import { isIndivisibleAsset } from '@utils'
import * as txHelper from "@asimovdev/asimovjs/lib/utils/TxHelper";
import BigNumber from "bignumber.js"

const initialState = {
  info: {
    walletId: '',
    name: '',
    lang: '',
    isTestNet: false,
    backupFlag: false,
    isImported: false,
  },
  selectedCoin: '',
  assets: [],
  trans: {},
  updateTrans: 0,
  mnemonicTemp: '',
  initState: false,
  specialUtxos: {}
}

function utxoSortBySpendable(allUtxo) {
  for (let asset in allUtxo) {
    allUtxo[asset] = allUtxo[asset].sort((utxoA, utxoB) => {
      if (utxoA.spendable && !utxoB.spendable)
        return -1;
      return 1;
    })
  }
}

async function getAssetsInfo(totalAssets) {
  let assetsInfo = {};
  let newAssets = [];

  CONSTANT.COINS.forEach(c => {
    if (!assetsInfo[c.asset]) {
      assetsInfo[c.asset] = Object.assign({}, c);
    }
  });

  // Find new asset
  totalAssets.forEach(i => {
    if (!assetsInfo[i]) {
      newAssets.push(i)
    }
  });

  if (newAssets.length) {

    let walletAddrs = await Storage.get("walletAddrs");
    let activeWltId = await Storage.get("activeWltId");
    let addrs = walletAddrs[activeWltId];
    let caller = addrs[0][0].address;
    let contractAddrs = await chain.getcontractaddressesbyassets([
      newAssets
    ])

    const allAssetsInfo = await chain.getAssetsInfo([newAssets]);
    for (let i = 0, len = newAssets.length; i < len; i++) {
      let asset = newAssets[i];
      let assetIndex = parseInt(asset.slice(16))
      let abiStr = JSON.stringify(CONSTANT.ASSETINFO_ABI);
      let data = txHelper.encodeCallData(CONSTANT.ASSETINFO_ABI[0], [assetIndex]);

      let [res, err] = await to(chain.callreadonlyfunction([caller, contractAddrs[i], data, CONSTANT.ASSETINFO_ABI_NAME, abiStr]));

      if (err) {
        if (allAssetsInfo[i]) {
          assetsInfo[asset] = {
            name: allAssetsInfo[i].name,
            coinSlug: allAssetsInfo[i].name,
            coinName: allAssetsInfo[i].name,
            coinType: 0,
            icon: 'default',
            addressPrefix: '',
            asset: asset,
            unit: allAssetsInfo[i].symbol,
            balance: 0,
            totalAmount: '',
            issueAddress: ''
          }

          allAssetsInfo[i].asset = asset
        } else {
          assetsInfo[asset] = {
            name: 'UNKNOWN',
            coinSlug: 'UNKNOWN',
            coinName: 'UNKNOWN',
            coinType: 0,
            icon: 'default',
            addressPrefix: '',
            asset: asset,
            unit: 'UNKNOWN',
            balance: 0,
            totalAmount: '',
            issueAddress: ''
          }
          console.log('asset ' + asset + ' has no detail info')
        }
      } else {

        if (res[0]) {
          assetsInfo[asset] = {
            name: res[2],
            coinSlug: res[3],
            coinName: res[1],
            coinType: 0,
            icon: res[2],
            addressPrefix: res[3] || res[3].toLowerCase(),
            asset: asset,
            unit: res[2],
            balance: 0,
            totalAmount: res[4],
            issueAddress: contractAddrs[i]
          }
        } else {
          console.log('asset ' + asset + ' has no detail info')
        }
      }
    }
    Cache.setAssetsInfo(allAssetsInfo || []);
    for (var a in assetsInfo) {
      if (a !== CONSTANT.DEFAULT_ASSET) {
        assetsInfo[a].icon = 'default';
      }
    }

  }
  return assetsInfo
}

export default {
  state: JSON.parse(JSON.stringify(initialState)),
  mutations: {
    setInitState(state, status) {
      state.initState = status
    },
    setWalletInfo(state, info) {
      state.info = info
    },
    setAssets(state, assets) {
      state.assets = [].concat(assets);
    },
    clearAssets(state) {
      state.assets = CONSTANT.COINS;
    },
    setTransaction(state, trans) {
      Object.assign(state, { trans: trans })
    },
    updateTransaction(state) {
      state.updateTrans++
    },
    initWalletInfo(state) {
      state = initialState
    },
    setSelectedCoin(state, asset) {
      state.selectedCoin = asset;
      Cache.setSelectIcon(asset.asset);
    },
    setMnemonic(state, mnemonic) {
      state.mnemonicTemp = mnemonic;
    },
    clearAllInfo(state) {
      state.info = {
        walletId: '',
        name: '',
        lang: '',
        isTestNet: false,
        backupFlag: false,
        isImported: false,
      };
      state.selectedCoin = '';
      state.assets = [];
      state.trans = {};
      state.updateTrans = 0;
      state.mnemonicTemp = '';
    },
    setSpecialUtxos(state, specialUtxos) {
      state.specialUtxos = specialUtxos
    }
  },
  actions: {
    setSelectedCoin({ commit }, payload) {
      commit('setSelectedCoin', payload)
    },
    setMnemonic({ commit }, payload) {
      commit('setMnemonic', payload)
    },
    clearAllInfo({ commit }) {
      commit('clearAllInfo');
    },
    initWltState({ commit }, payload) {
      commit('setWalletInfo', payload.info);
      commit('setAssets', payload.assets);
    },
    async queryAllBalance({ commit, state }) {
      let allAddrs = await Storage.get("walletAddrs");
      let wltInst = Wallets.getActiveWallet();
      let strAddrs = [];
      for (let changeType in allAddrs[wltInst.walletId]) {
        let exstAddrs = allAddrs[wltInst.walletId][changeType];

        for (let addr of exstAddrs) {
          strAddrs.push(addr.address);
        }
      }

      let trans = {}
      try {
        trans = await TranService.queryTransactionsByAddresses(strAddrs, 0, 20)
      } catch (e) {
        console.log(JSON.stringify(e))
      }

      // Add cache trasnsactions
      let transCache = Cache.getTransCache(wltInst.walletId)
      let cacheTxidArr = [];

      for (let cacheAsset in transCache) {
        for (let i = transCache[cacheAsset].length - 1; i >= 0; i--) {
          if (trans[cacheAsset]) {
            let check = false;
            for (let tran of trans[cacheAsset]) {
              if (transCache[cacheAsset][i].tranBaseInfo.txid === tran.txid) {
                Cache.removeTransCache(wltInst.walletId, cacheAsset, tran.txid)
                transCache[cacheAsset].splice(i, 1);
                check = true;
                break;
              }
            }
            if (!check) {
              trans[cacheAsset].unshift(transCache[cacheAsset][i].tranBaseInfo);
              cacheTxidArr.push(transCache[cacheAsset][i].tranBaseInfo.txid)
            }
          }
        }
      }

      if (cacheTxidArr.length) {
        const checkTran = await chain.getmempooltransactions([cacheTxidArr])
        for (let i = 0; i < cacheTxidArr.length; i++) {
          if (checkTran[cacheTxidArr[i]]) {
            cacheTxidArr.splice(i, 1);
          }
        }

        for (let txid of cacheTxidArr) {
          for (let asset in trans) {
            for (let i = 0; i < trans[asset].length; i++) {
              if (trans[asset][i].txid === txid) {
                trans[asset].splice(i, 1);
                Cache.removeTransCache(wltInst.walletId, trans[asset][i].asset, txid)
                break;
              }
            }
            break;
          }
        }
      }

      // Get balance
      let balances = await TranService.queryBalances(strAddrs);

      // Get assets array, asset utxo array
      let utxoAddrs = {},
        totalAsset = {};
      let totalAssetArray = [];

      for (let balance of balances) {
        for (let assets of balance.assets) {
          let key = assets.asset;
          if (totalAsset[key] == undefined) {
            if (isIndivisibleAsset(key)) {
              totalAsset[key] = 1;
            } else {
              totalAsset[key] = new BigNumber(assets.value).toString();
            }
          } else {
            if (isIndivisibleAsset(key)) {
              totalAsset[key] += 1;
            } else {
              totalAsset[key] = new BigNumber(totalAsset[key]).plus(assets.value).toString();
            }
          }
          if (!utxoAddrs[key]) {
            utxoAddrs[key] = [];
          }
          if (utxoAddrs[key].indexOf(balance.address) == -1) {
            utxoAddrs[key].push(balance.address);
          }
        }
      }

      for (let key in totalAsset) {
        totalAssetArray.push(key);
      }

      let assetsInfo = await getAssetsInfo(totalAssetArray)

      let preAssets = JSON.parse(JSON.stringify(state.assets));
      let preAssetsMap = {}

      preAssets.forEach(pa => {
        if (pa) {
          preAssetsMap[pa.asset] = pa;
        }
      });

      let temp = [];

      const infoAssetsId = Object.keys(assetsInfo), preAssetsId = Object.keys(preAssetsMap);
      let allAssetsId = infoAssetsId.concat(preAssetsId)
      allAssetsId = [...new Set(allAssetsId)];

      for (let asset of allAssetsId) {
        if (assetsInfo[asset]) {
          preAssetsMap[asset] = assetsInfo[asset]
        }
        if (!assetsInfo[asset] && preAssetsMap[asset]) {
          preAssetsMap[asset].balance = 0;
        }
        if (totalAsset[asset]) {
          preAssetsMap[asset].balance = totalAsset[asset]
        }
      }

      for (let asset in preAssetsMap) {
        temp.push(preAssetsMap[asset]);
      }

      preAssets = temp;

      wltInst.assets = preAssets;
      wltInst.storeWltInfo();
      commit("setTransaction", trans);
      commit("updateTransaction");
      commit("setAssets", temp);

      await Storage.set("walletUTXO" + wltInst.walletId, {});
      for (let asset of preAssets) {
        if (!asset) {
          continue
        }
        let key = asset.asset;
        if (utxoAddrs[key]) {
          const count = 1000;
          let from = 0, allUtxos = {};
          let res = await TranService.queryUTXOInPage([utxoAddrs[key][0], key, from, count]);
          allUtxos = await Storage.get("walletUTXO" + wltInst.walletId) || {};

          if (!allUtxos[key]) {
            allUtxos[key] = []
          }
          allUtxos[key] = allUtxos[key].concat(res.utxos);
          await Storage.set("walletUTXO" + wltInst.walletId, allUtxos);
        }
      }
      await Storage.set(("walletTrans" + wltInst.walletId), trans);
      commit('setInitState', true);

      const allUtxos = await Storage.get("walletUTXO" + wltInst.walletId) || {};

      // Save indivisible asset utxo
      const specialUtxos = {}
      for (let asset in allUtxos) {
        if (isIndivisibleAsset(asset)) {
          specialUtxos[asset] = allUtxos[asset]
        }
      }
      commit('setSpecialUtxos', specialUtxos)

      utxoSortBySpendable(allUtxos);
      await Storage.set("walletUTXO" + wltInst.walletId, allUtxos);
    }
  },
  getters: {
    getTransactionsByAsset: state => {
      let coin = state.selectedCoin || state.assets[0]
      return state.trans[coin.asset] || []
    },
    getMnemonic: state => {
      return state.mnemonicTemp;
    },
    selectedCoin: state => {
      const selectedIconCode = Cache.getSelectIcon();
      let selectedIcon = null;
      for (let asset of state.assets) {
        if (asset) {
          if (asset.asset === selectedIconCode) {
            selectedIcon = asset;
            break;
          }
        } else {
          continue;
        }
      }
      if (!selectedIcon) {
        return {
          addressPrefix: "",
          asset: "",
          balance: 0,
          coinName: "",
          coinSlug: "",
          coinType: 0,
          icon: "default",
          name: "",
          unit: ""
        }
      }
      return selectedIcon;
    },
    getInitState: state => state.initState,
    getSpecialUtxos: state => state.specialUtxos
  }
}

import { chain } from '@api/chain';
import { Transaction } from "@asimovdev/asimovjs"
import Storage from "@service/storage";
import AddressService from "@service/address";
import { CONSTANT } from "@/constant";
import { Message } from 'element-ui';
import Cache from "@service/cache";
import en from "@static/i18n/en.json"
import zh from "@static/i18n/zh.json"
import { isIndivisibleAsset } from "@utils";
import BigNumber from "bignumber.js";

const langJson = { en, zh };

function formateTransactionData(raw, addrs) {
  let transType = 0;
  let { blocktime, confirmations, vin = [], vout = [] } = raw;
  const mineAddress = [];
  const otherAddress = [];

  let isSend = vin.some(function (i) {
    return i.prevOut && i.prevOut.addresses && i.prevOut.addresses.every(function (addr) {
      return addrs.indexOf(addr) > -1
    })
  });
  let isCoinbase = !!vin[0].coinbase

  if (isSend) {
    let isMove = vout && vout.every(function (out) {
      return out.scriptPubKey.addresses && out.scriptPubKey.addresses.every(function (addr) {
        if (addrs.indexOf(addr) > -1) {
          mineAddress.push(addr);
          return true;
        } else {
          otherAddress.push(addr);
          return false;
        }
      })
    })
    if (isMove) {
      transType = 2;
    } else {
      transType = 1;
    }
  } else {
    vout.forEach(out => {
      out.scriptPubKey.addresses && out.scriptPubKey.addresses.forEach(addr => {
        (addrs.indexOf(addr) > -1 ? mineAddress : otherAddress).unshift(addr)
      })
    })
  }
  let asset = isCoinbase ? CONSTANT.DEFAULT_ASSET : (vin[0]['prevOut'] && vin[0]['prevOut']['asset'])
  let recieveAddress = transType === 1 ? otherAddress[0] : mineAddress[0];
  let fromAddress = isCoinbase ? 'coinbase' : vin[0].prevOut.addresses && vin[0].prevOut.addresses[0];

  let amount = 0, moveToSelf = false;
  for (let out of vout) {
    switch (transType) {
      case 0: if (out && out.scriptPubKey && out.scriptPubKey.addresses && out.scriptPubKey.addresses.indexOf(addrs[0]) >= 0 && out.asset === asset) {
        amount = new BigNumber(amount).plus(out.value || 0).toString();
      }
        break;
      case 1:
        if (out && out.scriptPubKey && out.scriptPubKey.addresses && out.scriptPubKey.addresses.indexOf(addrs[0]) < 0 && out.asset === asset) {
          amount = new BigNumber(amount).plus(out.value || 0).toString();
        }
        break;
      case 2:
        amount = new BigNumber(vout[0].value).toString();
        moveToSelf = true;
        break;
      default: break;
    }

    if (moveToSelf) {
      break;
    }
  }
  return {
    type: transType, // 0: Receive , 1: Send , 2: Move
    amount,
    asset,
    confirmations,
    blocktime,
    txid: raw.txid,
    fee: raw.fee ? raw.fee[0] : { value: 0, asset: CONSTANT.DEFAULT_ASSET },
    fromAddress,
    recieveAddress
  };
}

function PickUtxos(total, utxos, completelyMatch) {
  let t = 0;
  let result = [];

  if (!utxos || !utxos.length) {
    return [result, t];
  }

  total = new BigNumber(total);
  if (completelyMatch) {
    for (let i = 0; i < utxos.length; i++) {
      if (total.eq(utxos[i].amount)) {
        t = total.toString();
        result.push(utxos[i]);
        break;
      }
    }
  } else if (total.eq(0)) {
    let min;
    let bgVal;
    min = utxos[0];
    for (let i = 0; i < utxos.length; i++) {
      bgVal = new BigNumber(min && min.amount || 0);
      if (min && (bgVal.gt(utxos[i].amount || 0))) {
        min = utxos[i];
      }
    }

    t = min.amount;
    result.push(min);
  } else {
    for (let i = 0; i < utxos.length; i++) {
      if (total.gt(t)) {
        result.push(utxos[i])
        t = new BigNumber(t).plus(utxos[i].amount).toString();
      } else {
        break;
      }
    }
  }

  return [result, t];
}

function getLockIdAndAddressByStr(str) {
  const lockAddress = str.slice(0, 44);
  const __lock = str.slice(-8).split("");
  let lockId = __lock[6] + __lock[7] + __lock[4] + __lock[5] + __lock[2] + __lock[3] + __lock[0] + __lock[1];
  lockId = parseInt(lockId, 16);
  return {
    lockAddress,
    lockId
  }
}

function getCanVoteUtxos(allUtxos, voteConfig) {
  let votedUtxoAmount = 0, votedUtxos = []

  for (let i = 0, len = allUtxos.length; i < len; i++) {
    if (allUtxos[i].locks) {
      for (let lock of allUtxos[i].locks) {
        const { lockAddress, lockId } = getLockIdAndAddressByStr(lock.id);

        if (lockAddress === voteConfig.contractAddress && lockId === voteConfig.id && allUtxos[i].amount === lock.amount) {
          // Cache voted utxo and amount
          votedUtxoAmount = new BigNumber(votedUtxoAmount).plus(lock.amount).toString();
          votedUtxos.push(allUtxos[i])

          // Minus utxo that cannot vote
          allUtxos.splice(i, 1);
          i--;
          len--;
          break;
        }
      }
    }
  }

  return [allUtxos, votedUtxos, votedUtxoAmount]
}

function chooseVoteUtxo(assetArr, allUtxos, voteConfig, address) {
  // Vote transaction
  let changeOut = [], success = true, amount = 0;

  // Distinguish between multiple assets
  const coinId = assetArr[0].asset, feeId = assetArr[1].asset;

  // Type conversion
  let feeAmount = parseFloat(assetArr[1].amount);

  // Filter utxo that has voted and has no remaining credit
  let [ins, votedUtxos, votedUtxoAmount] = getCanVoteUtxos(allUtxos[coinId], voteConfig);

  if (ins.length) {
    if (coinId === feeId) {
      // Select the voted utxo for the fee(same currency)
      let votedUtxoAmountInTx = 0;
      if (votedUtxos.length) {
        for (let i = 0, len = votedUtxos.length; i < len; i++) {
          votedUtxoAmountInTx = new BigNumber(votedUtxoAmountInTx).plus(votedUtxos[i].amount);
          if (votedUtxoAmountInTx.gte(feeAmount)) {
            // Utxos used as fee was successfully
            votedUtxos.splice(i + 1);
            ins.push(...votedUtxos);
            amount = new BigNumber(voteConfig.balance).minus(feeAmount).minus(votedUtxoAmount).plus(votedUtxoAmountInTx).toString();
            changeOut.push({
              amount,
              assets: coinId,
              address
            })
            break;
          }
        }
      }

      if (votedUtxoAmountInTx < feeAmount) {
        // The utxo that has voted is not enough to be used as a commission, so choose from the utxo that can be voted
        for (let i = 0, len = ins.length; i < len; i++) {
          votedUtxoAmountInTx += ins[i].amount;
          if (votedUtxoAmountInTx >= feeAmount) {
            ins.push(...votedUtxos);
            amount = voteConfig.balance - feeAmount
            changeOut.push({
              amount,
              assets: coinId,
              address
            })
            break;
          }
        }

      }

      if (votedUtxoAmountInTx < feeAmount) {
        // There is not enough utxo for the fee, transaction failed
        success = false
      }

    } else {
      // Muti currency fee
      let [willspendUTXO, totalAmount] = PickUtxos(feeAmount, allUtxos[feeId]);
      const totalNum = new BigNumber(totalAmount)
      if (totalNum.lt(feeAmount)) {
        // There is not enough utxo for the fee, transaction failed
        success = false;
      } else {
        ins.push(...willspendUTXO);
        const amount = new BigNumber(voteConfig.balance).minus(votedUtxoAmount).toString();
        const changeAmount = totalNum.minus(feeAmount).toString();
        changeOut.push({
          amount: amount,
          assets: coinId,
          address
        })
        changeOut.push({
          amount: changeAmount,
          assets: feeId,
          address
        })
      }
    }
  }

  if (!success) {
    ins = [], changeOut = [];
  }

  return {
    voteIns: ins,
    voteChangeOut: changeOut
  }
}

export const TranService = {
  async queryBalances(addrs) {
    let [balances] = await to(chain.getbalances([addrs]));
    return balances || [];
  },
  async queryUTXOInPage(params) {
    return await chain.getutxoinpage(params);
  },
  async queryTransactionsByAddresses(addrs, offset, count) {
    let [res] = await to(chain.gettransactionsbyaddresses([addrs, offset, count]));

    let trans = [];
    let transactions = [];
    let rawTransactions = {};

    for (let addr in res) {
      if (res[addr].length) {
        trans = trans.concat(res[addr]);
      }
    }

    trans.forEach(raw => {
      rawTransactions[raw.txid] = raw;
      let formatedTrans = formateTransactionData(raw, addrs)
      let assetKey = formatedTrans.asset;

      if (!transactions[assetKey]) {
        transactions[assetKey] = [];
      }
      transactions[assetKey].push(formatedTrans);

    })
    return transactions;
  },
  async chooseUTXO(walletId, assetArr, voteConfig = null) {
    let allUtxos = await Storage.get("walletUTXO" + walletId);
    let allAddrs = await AddressService.getAddrs(walletId);
    const address = allAddrs[0][0].address;

    let ins = [], changeOut = [], success = true;

    if (voteConfig && voteConfig.isVoteTx && allUtxos) {
      const { voteIns, voteChangeOut } = chooseVoteUtxo(assetArr, allUtxos, voteConfig, address);
      ins = voteIns, changeOut = voteChangeOut;
    } else {
      // General transfer and general contract transaction
      // Asset classification
      const proxyAssetArr = [];
      for (let assetObj of assetArr) {
        let mark = false;
        for (let proxyAssetObj of proxyAssetArr) {
          if (assetObj.asset === proxyAssetObj.asset) {
            mark = true;
            proxyAssetObj.amount = new BigNumber(proxyAssetObj.amount).plus(assetObj.amount).toString();
            break;
          }
        }
        if (!mark) {
          proxyAssetArr.push(assetObj);
        }
      }

      // Multi-currency
      for (const assetObj of proxyAssetArr) {
        if (!assetObj || !assetObj.asset || !allUtxos) {
          break;
        }
        let utxos = allUtxos[assetObj.asset];

        // Filter freeze utxo
        let transCache = Cache.getTransCache(walletId, assetObj.asset);
        for (let tran of transCache) {
          for (let freezeUtxo of tran.freezeUtxo) {
            for (let i = 0; i < utxos.length; i++) {
              if (utxos[i].txid === freezeUtxo.txid && utxos[i].vout === freezeUtxo.vout) {
                utxos.splice(i, 1);
                break;
              }
            }
          }
        }

        const indivisibleAsset = isIndivisibleAsset(assetObj.asset)

        // Pick utxo
        let [willspendUTXO, totalAmount] = PickUtxos(assetObj.amount, utxos, indivisibleAsset);
        if (indivisibleAsset && !willspendUTXO.length) {
          success = false;
          break;
        } else {
          totalAmount = new BigNumber(totalAmount);
          const amount = totalAmount.minus(assetObj.amount).toString();
          changeOut.push({
            amount,
            assets: assetObj.asset,
            address
          })
        }

        ins = ins.concat(willspendUTXO);
      }
    }

    if (!success) {
      ins = [], changeOut = []
    }

    changeOut = changeOut.filter(out => out.amount > 0);
    return { ins, changeOut };
  },
  async generateRawTx(inputs, outputs, keys, gasLimit = 0) {
    const lang = await Storage.get('lang') || 'en';

    let tx;
    try {
      tx = new Transaction({
        inputs,
        outputs,
        gasLimit
      });

    } catch (e) {
      console.log(e);
      Message({
        message: langJson[lang].common_check_data2,
        type: 'error',
        duration: 3 * 1000
      })
      return ''
    }


    try {
      tx.sign(keys)
    } catch (e) {
      console.log(e);
      Message({
        message: langJson[lang].common_check_pw,
        type: 'error',
        duration: 3 * 1000
      })
      return ''
    }

    try {
      return tx.toHex();
    } catch (e) {
      console.log(e);
      Message({
        message: langJson[lang].common_check_data1,
        type: 'error',
        duration: 3 * 1000
      })
      return ''
    }
  }
}

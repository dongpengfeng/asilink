import * as BigNumber from 'bignumber.js'
import * as moment from 'moment'
import { CONSTANT } from "@/constant"
import * as bip39 from "bip39";
import Storage from "@service/storage";
import { crypto } from "bitcore-lib";

moment.locale('en')

export const sts2btc = (num, indivisibleAsset = false) => {
  if (indivisibleAsset) {
    return num;
  }
  if (num === 0) {
    return "0";
  } else if (num) {
    let numStr = new BigNumber(num).div(CONSTANT.TOSATOSHI).toFormat(8);
    return numStr.replace(/(?:\.0*|(\.\d+?)0+)$/, "$1");
  }
}

export const btc2sts = value => {
  if (!value) return value
  let v = new BigNumber(value.toString())
  return v.times(CONSTANT.TOSATOSHI).toFixed(0).toString();
}

export const getWordlistLanguage = function (text) {
  let reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
  return reg.test(text) ? 'chinese_simplified' : 'english'
}

export const validateMnemonic = function (mnemonic) {
  let lang = CONSTANT.MNEMONICLANGUAGES;
  let valid = false;
  for (let i = 0; i < lang.length; i++) {
    const wordlist = bip39.wordlists[lang[i]];
    valid = bip39.validateMnemonic(mnemonic, wordlist);
    if (valid) {
      break;
    }
  }
  return valid;
};

export function signature(pk, message) {
  const hashbuf = crypto.Hash.sha256sha256(new Buffer(message));
  return crypto.ECDSA.sign(hashbuf, pk).toBuffer().toString('base64');
}

export const getTimeInSection = function (timestamp) {
  timestamp *= 1000;
  let now = new Date()
  let time = moment(timestamp)
  let dist = now.getTime() - timestamp
  let result = ''
  if (!time.isSame(now, 'year')) {
    result = time.format('YYYY-MM-DD HH:mm')
  } else if (dist <= 86400000) {
    if (time.isSame(now, 'day')) {
      result = time.format('HH:mm')
    } else {
      result = time.calendar()
    }
  } else {
    result = time.format('MM-DD HH:mm')
  }
  return result
}

export async function getWalletPubKey() {
  const walletId = await Storage.get("activeWltId");
  const pubKeys = await Storage.getPubKeys();
  const { pubKey } = pubKeys[walletId][0][0];
  return pubKey;
}

export function getWalletName(allWltsArr) {
  let walletName = "My Wallet no.1";
  if (allWltsArr.length) {
    let count = 1;
    for (let i = 0; i < allWltsArr.length; i++) {
      if (allWltsArr[i].name === walletName) {
        i = -1;
        ++count;
        walletName = "My Wallet no." + count;
      }
    }
  }
  return walletName;
}

export function isIndivisibleAsset(assetId) {
  return assetId[7] === "1";
}
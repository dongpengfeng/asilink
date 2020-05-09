import bip39 from "bip39";
import { HDPrivateKey, crypto } from "bitcore-lib";
import { PrivateKey } from "@asimovdev/asimovjs";
import EncryptoService from "@service/encrypto";
import { CONSTANT } from "@/constant";
import Cfg from "@/cfg";
import Storage from '@service/storage';
import Wallets from "@service/wallets";
import { Loading } from 'element-ui';
import { getWordlistLanguage } from "@utils";
import Store from '@store';
import AddressService from "@service/address";

const PATH = "m/44'";
const PATH_FOR_ID = "m/6'/10003'/0'/0/0";

export default class Wallet {
  // Wallet data is divided into four parts: this file only holds the basic info; The other three are address, sendTransaction, and UTXO
  walletId;
  entropy;
  seed;
  xpubkeys;
  name;
  lang;
  isTestNet = false;
  backupFlag = false;
  isImported = false;
  assets = CONSTANT.COINS
  loadingInstance;

  constructor() {
    this.isTestNet = (Cfg.env == 0);
  }

  async create(config) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const {
          walletName,
          lang,
          mnemonicLength = 12,
          pwd
        } = config;
        this.name = walletName;
        this.lang = CONSTANT.WordListNameDict[lang];
        let mnemonic = this.generateMnemonic(mnemonicLength, pwd);
        let seed = this.generateSeedHex(mnemonic);
        this.setWalletId(seed);
        await this.saveWalletsOrder(this.walletId);
        this.setEntropy(
          bip39.mnemonicToEntropy(mnemonic, bip39.wordlists[this.lang]),
          pwd
        );
        this.setSeed(seed, pwd);
        await this.setXpubkey(seed);
        await this.storeWltInfo();
        await AddressService.generateAddress(1, 0);
        this.closeLoading();
        resolve();
      }, 200);
    })
  }

  async import(config) {
    this.showLoading();
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let { walletName, type, mnemonic, pwd, seed, privateKey } = config;
        this.isImported = true;
        this.backupFlag = true;
        this.name = walletName;

        if (type == 'mnemonic') {
          this.lang = getWordlistLanguage(mnemonic);
          seed = this.generateSeedHex(mnemonic);
          this.setWalletId(seed);
          this.setEntropy(
            bip39.mnemonicToEntropy(mnemonic, bip39.wordlists[this.lang]),
            pwd
          );
        } else {
          this.setWalletIdByPK(privateKey);
        }
        await this.saveWalletsOrder(this.walletId);
        if (type == 'mnemonic') {
          this.setSeed(seed, pwd);
          await this.setXpubkey(seed);
        } else {
          await this.setXpubkeyByPK(privateKey, pwd);
        }
        let allWallet = await Storage.get("walletInfo") || {};
        if (allWallet[this.walletId]) {
          delete allWallet[this.walletId];
        }
        await this.storeWltInfo();
        let allAddrs = await Storage.get('walletAddrs') || {};
        if (!allAddrs[this.walletId]) {
          if (type == 'mnemonic') {
            await AddressService.generateAddress(1, 0);
          } else {
            await AddressService.generateAddress(1, 0, undefined, privateKey);
          }
        }
        Store.dispatch('queryAllBalance');
        this.closeLoading();
        resolve();
      }, 100)
    })
  }

  async wake(info) {
    const {
      walletId,
      entropy,
      seed,
      name,
      lang,
      isTestNet = false,
      backupFlag = false,
      isImported = false,
      assets = [],
      xpubkeys
    } = info;
    this.walletId = walletId;
    this.entropy = entropy;
    this.seed = seed;
    this.name = name;
    this.lang = lang;
    this.isTestNet = isTestNet;
    this.backupFlag = backupFlag;
    this.isImported = isImported;
    this.assets = CONSTANT.COINS;

    this.xpubkeys = xpubkeys;
    Wallets.addWallet(this, true);
    this.initRedux();
  }

  async storeWltInfo() {
    let walletData = this.getInfo();
    const allWalletInfo = await Storage.get('walletInfo') || {};
    await Storage.set('walletInfo', Object.assign(allWalletInfo, {
      [this.walletId]: walletData
    }));
    Wallets.addWallet(this, true);
    this.initRedux();
  }

  initRedux() {
    const { walletId, name, lang, isTestNet, backupFlag, isImported } = this;

    Store.dispatch('initWltState', {
      info: {
        walletId,
        name,
        lang,
        isTestNet,
        backupFlag,
        isImported
      },
      assets: this.assets
    })
  }

  generateMnemonic(length) {
    let mnemo = bip39.generateMnemonic(
      length == 24 ? 256 : 128,
      undefined,
      bip39.wordlists[this.lang]
    );
    return mnemo;
  }

  generateSeedHex(mnemonic) {
    return bip39.mnemonicToSeedHex(mnemonic);
  }

  async setXpubkey(seed) {
    const hdPrivateKey = HDPrivateKey.fromSeed(seed).derive(
      `${PATH}/10003'/0'`);
    let xpubkeys = hdPrivateKey.xpubkey;
    this.xpubkeys = xpubkeys;

    const pubKey = hdPrivateKey.derive(0).derive(0).publicKey.toString();
    await this.savePubKey(pubKey);
  }

  async setXpubkeyByPK(privateKey, pwd) {
    this.setSeed(this.getFakeSeed(privateKey), pwd);
    const pubKey = new PrivateKey(privateKey).publicKey.toString();
    this.xpubkeys = pubKey;
    await this.savePubKey(pubKey);
  }

  getFakeSeed(pubKey) {
    return (pubKey + pubKey).slice(0, 128);
  }

  async savePubKey(pubKey) {
    let pubKeys = await Storage.getPubKeys() || {}
    const pubKeyArr = [];
    pubKeyArr.push([]);
    pubKeyArr[0].push({ pubKey })

    await Storage.setPubKeys(Object.assign(pubKeys, {
      [this.walletId]: pubKeyArr
    }))
  }

  setSeed(seed, pwd = "") {
    this.seed = this.encrypt(seed, pwd);
  }

  setEntropy(entropy, pwd = "") {
    this.entropy = this.encrypt(entropy, pwd);
  }

  setWalletIdByPK(privateKey) {
    // "m/44'/10003'/0'/0/0"
    let prvk = new PrivateKey(privateKey);
    this.walletId = crypto.Hash.sha256ripemd160(prvk.publicKey.toBuffer()).toString("hex");
  }

  setWalletId(seed) {
    // "m/6'/10003'/0'/0/0"
    let prvk = HDPrivateKey.fromSeed(seed).derive(PATH_FOR_ID);
    this.walletId = crypto.Hash.sha256ripemd160(prvk.publicKey.toBuffer()).toString("hex");
  }

  getInfo() {
    let info = {
      walletId: this.walletId,
      entropy: this.entropy,
      seed: this.seed,
      name: this.name,
      lang: this.lang,
      isTestNet: this.isTestNet,
      backupFlag: this.backupFlag,
      isImported: this.isImported,
      assets: this.assets,
      xpubkeys: this.xpubkeys
    };
    return info;
  }

  decrypt(text, pwd) {
    let k = CONSTANT.DEFAULT_PASSWORD;
    if (pwd) {
      k = k + this.walletId + EncryptoService.MD5(pwd);
    }
    return EncryptoService.sDecrypt(text, k);
  }

  encrypt(text, pwd) {
    let k = CONSTANT.DEFAULT_PASSWORD;
    if (pwd) {
      k = k + this.walletId + EncryptoService.MD5(pwd);
    }
    return EncryptoService.sEncrypt(text, k);
  }

  getPristineSeed(pwd = "") {
    return this.decrypt(this.seed, pwd);
  }

  getPristineEntropy(pwd = "") {
    return this.decrypt(this.entropy, pwd);
  }

  getMnemonic(pwd) {
    return bip39.entropyToMnemonic(
      this.getPristineEntropy(pwd),
      bip39.wordlists[this.lang]
    );
  }

  getPrivateKey(pwd) {
    return this.getPristineSeed(pwd).slice(0, 64)
  }

  validatePayPassword(payPassword) {
    let xpub = "", xpubkeys = this.xpubkeys, seed = this.getPristineSeed(payPassword);
    if (xpubkeys.length === 66) {
      xpub = new PrivateKey(seed.slice(0, 64)).publicKey.toString();
    } else {
      xpub = HDPrivateKey.fromSeed(seed).derive(
        `${PATH}/10003'/0'`).xpubkey;
    }
    return xpub == xpubkeys;
  }

  async getNoneBIP44PrivateKey(address, pwd) {
    let keypairs = await Storage.getKeypair();

    return keypairs[address] || '';
  }

  async getPrivateKeys(coinType, ins = [], pwd) {
    let seed = this.getPristineSeed(pwd);

    let rootkey = "";
    let keys = [];
    let allAddrs = await AddressService.getAddrs(this.walletId);

    if (this.entropy) {
      rootkey = HDPrivateKey.fromSeed(seed);
    }

    for (let utxo of ins) {
      let temp_key;
      for (let type in allAddrs) {
        for (let addrObj of allAddrs[type]) {
          if (addrObj.address == utxo.address) {
            let index = addrObj.index;
            let changeType = addrObj.changeType;
            if (index == undefined || changeType == undefined) {
              let pk = await this.getNoneBIP44PrivateKey(utxo.address, pwd);
              if (!pk) {
                console.error('address ' + utxo.address + 'has no private key ')
              } else {
                temp_key = pk;
              }
            } else if (this.entropy) {
              let privateKey = rootkey.derive(
                `${PATH}/${coinType}'/0'/${changeType}/${index}`
              ).privateKey;
              temp_key = privateKey.toString('hex');
            } else {
              temp_key = seed.slice(0, 64);
            }
            break;
          }
        }
      }

      keys.push(temp_key)
    }
    return keys;
  }

  getAuthPrivateKey(pwd, coinType) {
    const seed = this.getPristineSeed(pwd);
    let pk;
    if (this.entropy) {
      const rootkey = HDPrivateKey.fromSeed(seed);
      const pk = rootkey.derive(
        `${PATH}/${coinType}'/0'/0/0`
      ).privateKey;
    } else {
      pk = seed.splice(0, 64);
    }

    return pk;
  }

  showLoading() {
    this.loadingInstance = Loading.service({ lock: true, fullscreen: true, background: 'rgb(0, 0, 0,0.1)' });
  }

  closeLoading() {
    this.loadingInstance.close();
  }

  async saveWalletsOrder(walletId) {
    const walletsOrder = await Storage.get("walletsOrder") || []
    if (walletsOrder.indexOf(walletId) < 0) {
      walletsOrder.unshift(walletId);
      await Storage.set("walletsOrder", walletsOrder)
    } else {
      let walletInfo = await Storage.get("walletInfo");
      this.name = walletInfo[walletId].name;
    }
  }
}

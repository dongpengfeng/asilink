<template>
  <div
    class="home-container"
    :class="{'indivisible-asset-mode':indivisibleAssetMode}"
    @click="controlPanel"
  >
    <fw-head :checkChange="randomCount" @closeSideBar="closeSidePanel" />
    <fw-side-bar
      v-if="toggleSide"
      @toggle-side-func="showSideBar"
      :assets="assets"
      :autoClose="sideBar"
    />
    <div class="trading">
      <div class="left">
        <fw-coin-select @click="showSideBar" :selectedCoin="storeSelectedCoin"></fw-coin-select>
        <div v-if="indivisibleAssetMode" class="utxo-list-container">
          <fw-select
            :IAMode="true"
            :visible="utxoListToggle"
            :selected="storeSelectedCoin"
            @changeVisible="controlPanel(true)"
          >
            <template slot="options">
              <div class="extra_wrap">
                <span>{{storeSelectedCoin.coinName}}</span>
                <span>{{storeSelectedCoin.balance|sts2btc(indivisibleAssetMode)}}</span>
              </div>
              <div
                class="option_wrap hover-cell"
                v-for="(utxo,index) in utxoList"
                :key="index"
                :value="utxo.amount"
              >
                <span>#&nbsp;{{utxo.amount}}</span>
              </div>
            </template>
          </fw-select>
        </div>
        <div v-else>
          <div class="amount">{{storeSelectedCoin.balance|sts2btc(indivisibleAssetMode)}}</div>
        </div>
      </div>
      <div class="right">
        <button class="primary primary-active-btn" @click="()=>{modalHandle('Send')}">
          <img src="/images/icons/send_s_16p_w@2x.png" />
          {{$t('coin_send')}}
        </button>
        <br />
        <button @click="()=>{modalHandle('Receive')}" class="active-btn">
          <img src="/images/icons/qrcode_s_16p@2x.png" />
          {{$t('coin_receive')}}
        </button>
      </div>
    </div>
    <div class="transaction">
      <h3>
        {{$t('coin_transactions')}}
        <img
          src="/images/icons/refresh.png"
          @click="checkTran"
          :class="{checking}"
        />
      </h3>
      <ul v-if="getTransactionsByAsset.length">
        <li
          class="hover-cell"
          v-for="(item,key) in getTransactionsByAsset"
          :key="key"
          @click="()=>{transDetailHandle(item)}"
        >
          <div class="detail">
            <fw-icon
              :path="`icons/record_${item.type == 0 ? 'recieve': (item.type == 1 ? 'send':'move')}@2x.png`"
            ></fw-icon>
            <div class="data">
              <p v-if="indivisibleAssetMode">
                <span
                  class="amount"
                >{{item.type == 1 ? '-': (item.type == 0 ? '+' :'')}}{{storeSelectedCoin.coinName}}:&nbsp;&nbsp;</span>
                <span class="unit">{{item.amount|sts2btc(indivisibleAssetMode)}}</span>
              </p>

              <p v-else>
                <span
                  class="amount"
                >{{item.type == 1 ? '-': (item.type == 0 ? '+' :'')}}{{item.amount|sts2btc(indivisibleAssetMode)}}</span>
                <span class="unit">{{storeSelectedCoin.unit}}</span>
              </p>
              <p class="addr">{{item.type === 0 ? item.recieveAddress : item.fromAddress}}</p>
            </div>
          </div>
          <span class="line"></span>
          <div class="info">
            <time v-if="item.blocktime">{{item.blocktime | time }}</time>
            <time v-else style="color:#02BA3D">{{$t('common_confirming')}}</time>
            <div class="status" v-if="item.confirmations == 0">{{$t('coin_send_confirming')}}…</div>
            <div class="status" v-if="item.type == 2">{{$t('txn_moved')}}</div>
          </div>
        </li>
      </ul>
      <div class="prompt" v-else>{{$t('transaction_none')}}</div>
    </div>
    <ModalQrcode
      :visible="showReceiveModal"
      :data="qrcodeShowData"
      @close="()=>{modalHandle('Receive')}"
    ></ModalQrcode>
    <ModalSendCoin
      :visible="showSendModal"
      :walletName="walletName"
      :assets.sync="assets"
      :toAddr="sendModalToAddr"
      @close="()=>{modalHandle('Send')}"
      @confirm="handleConfirmSendCoin"
      @scan="()=>{modalHandle('ScanQR')}"
      @clearToAddr="sendModalToAddr=''"
    ></ModalSendCoin>
    <ModalTransactionDetail
      :visible="showTransDetailModal"
      transactionType="Receive"
      :detail="showTransDetailData"
      @close="()=>{modalHandle('TransDetail')}"
    ></ModalTransactionDetail>
    <ModalAuthPassword
      :visible="showPasswordModal"
      @close="()=>{modalHandle('Password')}"
      @confirm="confirmSend"
    ></ModalAuthPassword>
    <ModalScanQR :visible="showScanQRModal" @close="()=>{modalHandle('ScanQR')}" @scan="getToAddr" />
  </div>
</template>
<script>
import Wallets from "@service/wallets";
import { CONSTANT } from "@/constant";
import { TranService } from "@service/transaction";
import fwHead from "./head";
import ModalQrcode from "./ModalQrcode";
import ModalSendCoin from "./ModalSendCoin";
import ModalScanQR from "./ModalScanQR";
import ModalTransactionDetail from "./ModalTransactionDetail";
import ModalAuthPassword from "@components/ModalAuthPassword";
import { mapGetters, mapState } from "vuex";
import Storage from "@service/storage";
import { chain } from "@api/chain";
import Cache from "@service/cache";
import Store from "@store";
import cfg from "@/cfg.js";
import { Loading } from "element-ui";
import { isIndivisibleAsset } from "@utils";

export default {
  name: "home-container",
  components: {
    fwHead,
    ModalQrcode,
    ModalSendCoin,
    ModalTransactionDetail,
    ModalAuthPassword,
    ModalScanQR
  },
  computed: {
    ...mapState({
      trans: state => {
        return state.wltState.trans;
      },
      assets: state => {
        return state.wltState.assets;
      },
      storeSelectedCoin: state => {
        return state.wltState.selectedCoin || state.wltState.assets[0];
      }
    }),
    ...mapGetters([
      "getTransactionsByAsset",
      "selectedCoin",
      "getSpecialUtxos"
    ]),
    tranState() {
      return this.$store.state.wltState.updateTrans;
    },
    walletName() {
      return this.$store.state.wltState.info.name;
    },
    indivisibleAssetMode() {
      return isIndivisibleAsset(this.storeSelectedCoin.asset);
    },
    utxoList() {
      if (this.indivisibleAssetMode) {
        return this.getSpecialUtxos[this.storeSelectedCoin.asset] || [];
      }
    }
  },
  data: () => {
    return {
      toggleSide: false,
      showSendModal: false,
      showReceiveModal: false,
      showTransDetailModal: false,
      showPasswordModal: false,
      showScanQRModal: false,
      randomCount: 0,
      sideBar: 0,
      checking: false,
      showTransDetailData: {
        trans: {},
        selectedCoin: {},
        walletName: ""
      },
      qrcodeShowData: {
        selectedCoin: {},
        address: ""
      },
      transList: [],
      signData: {},
      sendModalToAddr: "",
      exchange: {
        rate: 1,
        unit: Cache.getCurrency()
      },
      utxoListToggle: false
    };
  },
  created() {
    this.$store.dispatch("queryAllBalance");
    this.showSendModal = Cache.getTranPanelToggle();
    this.getTrans();
  },
  methods: {
    controlPanel(target) {
      this.utxoListToggle = target === true ? !this.utxoListToggle : false;
      this.randomCount++;
    },
    closeSidePanel() {
      this.utxoListToggle = false;
      this.sideBar++;
    },
    async getTrans() {
      const { walletId } = this.$store.state.wltState.info;
      let theAllTrans = (await Storage.get("walletTrans" + walletId)) || {};

      this.transList = theAllTrans[this.selectedCoin.asset] || [];
    },
    async modalHandle(whichModal) {
      this["show" + whichModal + "Modal"] = !this[
        "show" + whichModal + "Modal"
      ];
      switch (whichModal) {
        case "Receive":
          let walletId = this.$store.state.wltState.info.walletId;
          let addresses = await Storage.get("walletAddrs");
          this.qrcodeShowData = {
            selectedCoin: this.storeSelectedCoin,
            address: addresses[walletId][0][0].address
          };
      }
    },
    async confirmSend(password) {
      this.modalHandle("Password");
      let loadingInstance = Loading.service({
        lock: true,
        fullscreen: true,
        background: "rgb(0, 0, 0,0.1)"
      });
      try {
        let { ins, outs, gasLimit, tranBaseInfo } = this.signData;
        let wltInst = Wallets.getActiveWallet();

        let keys = await wltInst.getPrivateKeys(
          CONSTANT.DEFAULT_COIN.coinType,
          ins,
          password
        );
        let txraw = await TranService.generateRawTx(ins, outs, keys, gasLimit);
        let result = await chain.sendrawtransaction([txraw]);
        this.$message({
          type: result ? "success" : "error",
          message: result ? this.$t("txn_sent") : this.$t("txn_failed"),
          duration: 2 * 1000
        });

        this.modalHandle("Send");
        loadingInstance.close();
        if (result) {
          let transCache = Cache.getTransCache(
            wltInst.walletId,
            tranBaseInfo.asset
          );

          let allAddrs = await Storage.get("walletAddrs");
          let strAddrs = [];
          for (let changeType in allAddrs[wltInst.walletId]) {
            let exstAddrs = allAddrs[wltInst.walletId][changeType];
            for (let addr of exstAddrs) {
              strAddrs.push(addr.address);
            }
          }

          tranBaseInfo.type =
            strAddrs.indexOf(tranBaseInfo.recieveAddress) >= 0 ? 2 : 1;
          tranBaseInfo.txid = result;

          let freezeUtxo = [];
          for (let utxo of ins) {
            freezeUtxo.push({
              txid: utxo.txid,
              vout: utxo.vout
            });
          }

          Cache.setTransCache(wltInst.walletId, tranBaseInfo.asset, {
            tranBaseInfo,
            freezeUtxo
          });

          Store.dispatch("queryAllBalance");
        }
      } catch (e) {
        this.$message({
          message: this.$t("coin_send_failed"),
          type: "error",
          duration: 3000
        });
        loadingInstance.close();
      }
    },
    checkTran() {
      this.checking = true;
      Store.dispatch("queryAllBalance");
      chain.getmempooltransactions([[""]]).then(
        res => {
          if (JSON.stringify(res) === "{}") {
            setTimeout(() => {
              this.$message({
                type: "success",
                message: this.$t("refresh_done"),
                duration: 2 * 1000
              });
              this.checking = false;
            }, 500);
          }
        },
        err => {
          this.checking = false;
        }
      );
    },
    showSideBar() {
      this.toggleSide = !this.toggleSide;
    },
    sendHandle() {
      this.showSendModal = true;
    },
    receiveHandle() {
      this.showReceiveModal = true;
    },
    handleConfirmSendCoin(e) {
      this.modalHandle("Password");
      this.signData = e;
    },
    transDetailHandle(item) {
      this.showTransDetailModal = true;
      this.showTransDetailData = {
        trans: item,
        selectedCoin: this.storeSelectedCoin,
        walletName: this.walletName
      };
    },
    getToAddr(addr) {
      this.showScanQRModal = false;
      this.sendModalToAddr = addr;
    }
  },
  watch: {
    tranState(newVal, oldVal) {
      this.getTrans();
      let selectedCoin = false;
      for (let asset of this.assets) {
        if (asset.asset === this.selectedCoin.asset) {
          selectedCoin = asset;
          break;
        }
      }
      this.$store.dispatch("setSelectedCoin", selectedCoin || this.assets[0]);
    },
    storeSelectedCoin(newVal) {
      this.qrcodeShowData.selectedCoin = newVal;
    }
  }
};
</script>
<style lang="scss">
@import "./index.scss";
</style>

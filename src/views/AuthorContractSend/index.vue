<template>
  <div class="author-contract-send_container">
    <div class="contract-send__wrapper">
      <div class="contract-send__container flex-container">
        <div class="contract-send__title">{{$t("contract_deal")}}</div>
        <img width="74" height="20" src="/images/icons/logo_m@2x.png" alt />
      </div>
    </div>
    <div class="amount__wrapper" :class="{'divisibl-container':indivisibleAssetMode}">
      <div class="title-font">{{$t('common_amount')}}</div>
      <fw-coin-select :selectedCoin="selectedCoin">
        <span class="divisibl-amount" v-if="indivisibleAssetMode">#{{sendAmount}}</span>
        <span class="amount-wrap" v-else>{{sendAmount|sts2btc}}</span>
      </fw-coin-select>
    </div>
    <div class="send-from__container flex-container">
      <div class="title-font">{{$t('common_from')}}</div>
      <div class="wallet-name">{{wltInst.name}}</div>
    </div>
    <div class="send-to__container flex-container" v-if="deployContractData.to">
      <div class="title-font">{{$t('send_to_address')}}</div>
      <div class="send-to-address location">
        {{deployContractData.to}}
        <img
          src="/images/icons/copy_blue.png"
          @click="handleCopy(deployContractData.to,$event)"
        />
      </div>
    </div>
    <div class="send-data__container flex-container" v-if="deployContractData.data">
      <div class="title-font">{{$t('common_data')}}</div>
      <div class="send-data location">
        {{deployContractData.data}}
        <img
          src="/images/icons/copy_blue.png"
          @click="handleCopy(deployContractData.data,$event)"
        />
      </div>
    </div>
    <div class="miner-fee__container">
      <div class="title">
        <div>{{$t('coin_send_fee')}}</div>
        <el-switch v-model="advancedOptions" :inactive-text="$t('advanced_options')" :width="32" />
      </div>

      <p v-show="tip" class="tip">{{$t('send_error2')}}</p>
      <div style="display:flex">
        <el-row style="width:100%">
          <el-col :span="18">
            <el-input v-model="fee" type="number" :disabled="!advancedOptions"></el-input>
          </el-col>
          <el-col :span="6">
            <el-select class="unit" v-model="feeAsset" :placeholder="$t('search_hint')">
              <el-option
                v-for="(asset,index) in proxyAssets"
                :key="asset.asset"
                :label="asset.unit"
                :value="index"
              ></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>

      <div class="advice" v-show="!advancedOptions">
        <div
          class="number active-btn"
          v-for="(item,index) in adviceArr"
          :key="index"
          :class="{choose:adviceIndex===index}"
          @click="chooseFee(index)"
        >
          <p class="name">{{$t(item.name)}}</p>
          <p class="amount">{{item.amount}}</p>
        </div>
      </div>

      <div class="warn-info" v-show="feeError">{{$t('no_enough_fee')}}</div>

      <div class="gas" v-show="advancedOptions">
        <div class="wrapper">
          <p class>{{$t('gas_limit')}}</p>
          <el-input v-model="gasLimit" :placeholder="$t('hint_enter_amount')" type="number"></el-input>
        </div>
        <div class="wrapper">
          <p class>{{$t('gas_price')}}</p>
          <el-input
            v-model="gasPrice"
            :disabled="true"
            :placeholder="$t('hint_enter_amount')"
            type="number"
          ></el-input>
        </div>
      </div>
    </div>
    <div class="footer__btns flex-container">
      <div
        class="footer__btn footer-cancel__btn active-btn"
        @click="closeModal"
      >{{$t('common_cancel')}}</div>
      <div
        class="footer__btn footer-confirm__btn suc-active-btn"
        :class="{disabled:!isVerify}"
        @click="switchPasswordModal(isVerify)"
      >{{$t('common_confirm')}}</div>
    </div>
    <ModalAuthPassword
      :visible="showPasswordModal"
      @close="switchPasswordModal"
      @confirm="handlePasswordConfirm"
    ></ModalAuthPassword>
  </div>
</template>
<script>
import Storage from "@service/storage";
import Wallet from "@classes/Wallet";
import { Rate } from "element-ui";
import ModalAuthPassword from "@components/ModalAuthPassword";
import { TranService } from "@service/transaction";
import { CONSTANT } from "@/constant";
import { signature } from "@utils";
import Store from "@store";
import { btc2sts, sts2btc, isIndivisibleAsset } from "@utils";
import { chain } from "@api/chain";
import { mapState, mapGetters } from "vuex";
import Cache from "@service/cache";
import handleClipboard from "@utils/clipboard";
import { DefaultFee } from "@asimovdev/asimovjs";
import * as txHelper from "@asimovdev/asimovjs/lib/utils/TxHelper";
import BigNumber from "bignumber.js";

export default {
  components: {
    ModalAuthPassword
  },
  data() {
    const proxyAssets = [];
    const defaultFee = sts2btc(DefaultFee.amount);
    proxyAssets.push(CONSTANT.DEFAULT_COIN);
    return {
      deployContractData: {
        data: String,
        to: String,
        from: String,
        type: String,
        amount: Number,
        toSignMessage: String,
        assetId: String
      },
      wltInst: {},
      showPasswordModal: false,
      sendAmount: 0,
      broadcast: true,
      id: 0,
      gasLimit: 0,
      gasLimitTarget: 0,
      advancedOptions: false,
      fee: 0,
      feeAsset: 0,
      adviceIndex: 1,
      exchange: 1,
      proxyAssets,
      blockHeight: 0,
      addrArr: [],
      isVoteTx: false,
      voteId: 0,
      noUtxoToVote: false,
      voteValue: 0,
      defaultFee,
      autoFee: false,
      allUtxoSpendable: true,
      __ins: null,
      __outs: null
    };
  },
  async created() {
    let dataObj = await Storage.get("authorContractSendData");
    this.deployContractData = dataObj.data;
    this.id = dataObj.id || "";
    let { data, amount, broadcast, type } = this.deployContractData;
    if (type === "vote") {
      this.isVoteTx = true;
      this.voteId = parseInt(data.slice(-64), 16);
    }
    if (broadcast === false) {
      this.broadcast = false;
    }
    this.sendAmount = amount || CONSTANT.DEPLOY_CONTRACT_SENDAMOUNT;
    this.gasLimit = this.gasLimitTarget = 21000;

    await Storage.set("authorContractSendData", {});

    let activeWltId = await Storage.get("activeWltId");
    let walletInfo = await Storage.get("walletInfo");
    let wltInfo = walletInfo[activeWltId];
    this.wltInst = new Wallet();
    await this.wltInst.wake(wltInfo);
    this.$store.dispatch("queryAllBalance");

    this.chooseFee(this.adviceIndex);
    await this.getWalletAddr();

    window.addEventListener("unload", () => {
      chrome.runtime.sendMessage({
        type: "POST_CheckCloseEvent",
        result: {
          success: true
        },
        id: this.id
      });
    });
  },
  methods: {
    async getWalletAddr() {
      const allAddrs = await Storage.get("walletAddrs");
      const strAddrs = [];
      for (let changeType in allAddrs[this.wltInst.walletId]) {
        let exstAddrs = allAddrs[this.wltInst.walletId][changeType];
        for (let addr of exstAddrs) {
          strAddrs.push(addr.address);
        }
      }
      this.addrArr = strAddrs;
    },
    chooseFee(index = this.adviceIndex) {
      this.adviceIndex = index;
      this.fee = new BigNumber(this.adviceArr[index].amount)
        .times(this.exchange)
        .toString();
    },
    async switchPasswordModal(canDo = true) {
      if (!canDo) {
        return;
      }
      if (this.noUtxoToVote) {
        this.$message({
          type: "warning",
          duration: 3000,
          message: this.$t("no_utxo_to_vote")
        });
        return;
      }
      if (!this.allUtxoSpendable) {
        this.$message({
          type: "warning",
          duration: 5000,
          message: this.$t("not_all_utxo_spendable_warn")
        });
        return;
      }
      this.showPasswordModal = !this.showPasswordModal;
    },
    async handlePasswordConfirm(password) {
      if (!this.wltInst.validatePayPassword(password)) {
        this.$message({
          showClose: true,
          message: this.$t("toast_incorrect_password"),
          type: "error"
        });
        return;
      }

      this.showPasswordModal = false;
      const { ins, outs } = await this.generateInsAndOuts();

      let keys = await this.wltInst.getPrivateKeys(
        CONSTANT.DEFAULT_COIN.coinType,
        ins,
        password
      );

      const net = Cache.getNetwork().value;
      const sendMsg = {
        net,
        success: false
      };
      try {
        let rawtx = await TranService.generateRawTx(
          ins,
          outs,
          keys,
          this.gasLimit || 0
        );
        let contractAddr = {};
        if (!rawtx) {
          chrome.runtime.sendMessage({
            type: "POST_ContractSend",
            result: sendMsg,
            id: this.id
          });
          return;
        }

        sendMsg.success = true;
        sendMsg.data = { rawtx };

        if (this.deployContractData.toSignMessage) {
          const pk = this.wltInst.getAuthPrivateKey(
            password,
            CONSTANT.DEFAULT_COIN.coinType
          );
          const signatureStr = signature(
            pk,
            this.deployContractData.toSignMessage
          );
          sendMsg.data.signature = signatureStr;
        }

        if (this.broadcast) {
          let res = await chain.sendrawtransaction([rawtx]);
          sendMsg.data.txid = res;

          if (!res) {
            this.$message({
              message: this.$t("txn_failed"),
              type: "error",
              duration: 2000
            });
            return;
          }

          if (this.deployContractData.type == "create") {
            outs.forEach(o => {
              o.amount = new BigNumber(o.amount).toString();
            });

            contractAddr = await chain.calculatecontractaddress([ins, outs]);
          }

          let transCache = Cache.getTransCache(
            this.wltInst.walletId,
            this.selectedCoin.asset
          );

          const tranBaseInfo = {
            amount: this.sendAmount,
            fee: {
              value: btc2sts(this.fee),
              name: this.proxyAssets[this.feeAsset].unit
            },
            fromAddress: this.addrArr[0],
            recieveAddress: this.deployContractData.to,
            asset: this.selectedCoin.asset,
            txid: res,
            type: this.addrArr.indexOf(this.deployContractData.to) >= 0 ? 2 : 1
          };

          const freezeUtxo = [];
          for (let utxo of ins) {
            freezeUtxo.push({
              txid: utxo.txid,
              vout: utxo.vout
            });
          }

          Cache.setTransCache(this.wltInst.walletId, tranBaseInfo.asset, {
            tranBaseInfo,
            freezeUtxo
          });

          chrome.runtime.sendMessage({
            type: "POST_ContractSend",
            result: sendMsg,
            id: this.id
          });

          this.$message({
            message:
              this.deployContractData.type == "create"
                ? `${this.$t("contract_ads")}:` + contractAddr[0]
                : this.$t("contract_called"),
            type: "success",
            duration: this.deployContractData.type == "create" ? 0 : 2000,
            onClose: () => {
              chrome.runtime.sendMessage({
                type: "CLOSE_MODAL"
              });
            }
          });
        } else {
          chrome.runtime.sendMessage({
            type: "POST_ContractSend",
            result: sendMsg,
            id: this.id
          });
          this.$message({
            message: this.$t("txn_created"),
            type: "success",
            duration: 2 * 1000,
            onClose: () => {
              chrome.runtime.sendMessage({
                type: "CLOSE_MODAL"
              });
            }
          });
        }
      } catch (e) {
        sendMsg.msg = e.message;
        sendMsg.data = {};
        chrome.runtime.sendMessage({
          type: "POST_ContractSend",
          result: sendMsg,
          id: this.id
        });
        this.$message({
          message: `${this.$t("txn_failed")}:` + e.message,
          type: "error",
          duration: 3 * 1000
        });
      }
    },
    closeModal() {
      chrome.runtime.sendMessage({
        type: "POST_ContractSend",
        result: {
          success: false
        },
        id: this.id
      });
      chrome.runtime.sendMessage({
        type: "CLOSE_MODAL"
      });
    },
    handleCopy(data, $event) {
      this.$message({
        message: this.$t("copy_success"),
        type: "success",
        duration: 2 * 1000
      });
      handleClipboard(data, $event);
    },
    async generateInsAndOuts() {
      const assetObjArr = [];

      assetObjArr.push({
        amount: new BigNumber(this.sendAmount).toString(),
        asset: this.selectedCoin.asset
      });
      if (this.autoFee) {
        assetObjArr.push({
          amount: btc2sts(this.fee),
          asset: this.proxyAssets[this.feeAsset].asset
        });
      }
      try {
        const { ins, changeOut } = await TranService.chooseUTXO(
          this.wltInst.walletId,
          assetObjArr,
          {
            isVoteTx: this.isVoteTx,
            balance: this.selectedCoin.balance,
            id: this.voteId,
            contractAddress: this.deployContractData.to
          }
        );
        let outs = [];
        if (ins.length) {
          if (
            this.deployContractData.type == "create" &&
            !this.deployContractData.to
          ) {
            this.deployContractData.to = ins[0].address;
          }

          this.allUtxoSpendable = ins.every(utxo => utxo.spendable);

          const out = {
            amount: new BigNumber(this.sendAmount).toString(),
            assets: this.selectedCoin.asset,
            address: this.deployContractData.to,
            data: this.deployContractData.data || "",
            contractType: this.deployContractData.type || ""
          };
          outs.push(out);
          if (changeOut.length) {
            outs = outs.concat(changeOut);
          }
        }

        if (this.isVoteTx && ins.length === 0) {
          this.noUtxoToVote = true;
        } else {
          this.noUtxoToVote = false;
          this.voteValue = 0;

          for (let out of outs) {
            if (
              out.assets === this.selectedCoin.asset &&
              out.address === this.addrArr[0]
            ) {
              this.voteValue += new BigNumber(this.voteValue)
                .plus(out.amount)
                .toNumber();
            }
          }
        }

        this.__ins = ins;
        this.__outs = outs;
        return { ins, outs };
      } catch (err) {
        return { ins: [], outs: [] };
      }
    },
    initFeeList() {
      chain.getfeelist().then(feeList => {
        if (feeList.length) {
          this.proxyAssets = this.assets.filter(asset => {
            if (asset && asset.asset) {
              for (let feeAsset of feeList) {
                if (feeAsset && feeAsset.assets) {
                  let assetId = asset.asset;
                  if (feeAsset.assets.indexOf("0x") >= 0) {
                    assetId = "0x" + assetId;
                  }
                  if (assetId === feeAsset.assets) {
                    asset.height = feeAsset.height;
                    return asset;
                  }
                }
              }
            }
          });
        }
      });

      chain.getblockchaininfo().then(res => {
        this.blockHeight = res.blocks;
      });
    },
    getEstimateGas() {
      setTimeout(() => {
        const { from, to, assetId, type, data } = this.deployContractData;
        const sendAmount = new BigNumber(this.sendAmount);
        if (
          CONSTANT.ADDRESS_REG.test(to) &&
          (assetId === this.selectedCoin.asset || !assetId) &&
          sendAmount.gte(0) &&
          data &&
          type &&
          this.addrArr.length
        ) {
          chain
            .getEstimateGas([
              from || this.addrArr[0],
              to,
              sendAmount.toNumber(),
              this.selectedCoin.asset,
              data,
              type,
              this.voteValue || 0
            ])
            .then(
              res => {
                this.gasLimit = this.gasLimitTarget = Math.max(
                  parseInt(res * 1.1),
                  21000
                );

                return res;
              },
              err => {
                this.gasLimit = this.gasLimitTarget = 10000000;
              }
            )
            .finally(() => {
              this.gasPlus();
            });
        }
      }, 500);
    },
    gasPlus(ins = this.__ins, outs = this.__outs) {
      try {
        if (new BigNumber(this.sendAmount).gte(0)) {
          this.gasLimit = txHelper.estimateGas(ins, outs, this.gasLimitTarget);
        }
      } catch (e) {
        console.log(e);
      }
    }
  },
  computed: {
    ...mapState({
      trans: state => {
        return state.wltState.trans;
      },
      assets: state => {
        return state.wltState.assets;
      },
      selectedCoin: state => {
        return state.wltState.selectedCoin || state.wltState.assets[0];
      }
    }),
    ...mapGetters(["getInitState"]),
    gasPrice() {
      this.feeMonitoring;
      let result = new BigNumber(btc2sts(this.fee))
        .div(this.gasLimit)
        .toNumber();
      if (!Number.isFinite(result)) {
        result = 0;
      }
      return result.toFixed(6);
    },
    maxAmount() {
      return new BigNumber(this.selectedCoin.balance)
        .minus(
          this.proxyAssets[this.feeAsset].asset === this.selectedCoin.asset
            ? btc2sts(this.fee)
            : 0
        )
        .toString();
    },
    isVerify() {
      let verifyNumber = true;
      if (this.indivisibleAssetMode) {
        this.sendAmount > 0;
      } else {
        this.maxAmount >= this.sendAmount &&
          this.sendAmount >= 0 &&
          this.sendAmount !== "";
      }

      const fee = new BigNumber(btc2sts(this.fee));

      return (
        this.selectedCoin.balance > 0 &&
        verifyNumber &&
        fee.gte(1) &&
        fee.lte(this.proxyAssets[this.feeAsset].balance)
      );
    },
    tip() {
      return (
        !this.indivisibleAssetMode &&
        (this.fee > this.proxyAssets[this.feeAsset].balance ||
          this.sendAmount > this.maxAmount)
      );
    },
    adviceArr() {
      const defaultFee = new BigNumber(this.defaultFee);
      return [
        {
          name: "slow_speed",
          amount: defaultFee.toString()
        },
        {
          name: "aver_speed",
          amount: defaultFee.times(2).toString()
        },
        {
          name: "fast_speed",
          amount: defaultFee.times(4).toString()
        }
      ];
    },
    indivisibleAssetMode() {
      return isIndivisibleAsset(this.selectedCoin.asset);
    },
    feeError() {
      const fee = new BigNumber(btc2sts(this.fee));
      return (
        this.indivisibleAssetMode &&
        fee.toString() &&
        fee.gt(this.proxyAssets[this.feeAsset].balance)
      );
    }
  },
  asyncComputed: {
    async feeMonitoring() {
      if (
        parseFloat(this.sendAmount) >= 0 &&
        parseFloat(this.fee) >= 0 &&
        this.getInitState
      ) {
        const { ins, outs } = await this.generateInsAndOuts();

        if (!this.advancedOptions) {
          this.defaultFee = sts2btc(
            txHelper.estimateFee(ins, outs, this.gasLimitTarget)
          );
          this.chooseFee();
          this.autoFee = true;
        }
      }
      return false;
    }
  },
  watch: {
    advancedOptions(newVal) {
      if (!newVal) {
        this.gasLimit = this.gasLimitTarget;
        this.chooseFee(this.adviceIndex);
      }
    },
    assets(newVal) {
      const { assetId } = this.deployContractData;
      if (newVal.length >= 2 && assetId) {
        for (let asset of newVal) {
          if (asset.asset === assetId) {
            this.$store.dispatch("setSelectedCoin", asset);
            break;
          }
        }
      }
      this.initFeeList();
    },
    feeAsset(newAsset) {
      if (this.proxyAssets[newAsset].height > this.blockHeight - 1) {
        this.$message({
          message: this.$t("fee_warn", {
            count: this.proxyAssets[newAsset].height - this.blockHeight + 1
          }),
          type: "warning",
          duration: 3000
        });
      }
    },
    fee(newVal, oldVal) {
      if (newVal) {
        this.getEstimateGas();
      }
    }
  }
};
</script>
<style>
html {
  width: 480px !important;
  height: 590px !important;
}
</style>
<style lang="scss">
@import "./index.scss";
</style>

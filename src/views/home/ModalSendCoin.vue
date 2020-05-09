<template>
  <ModalContainer :visible="visible" :top="1" :height="578" :width="61.5">
    <ModalHeader
      slot="header"
      :title="$t('coin_send_title',{value: selectedCoin.coinName})"
      :icon_src="selectedCoin.icon"
      @close="handleClose"
    />
    <div class="send-coin__container" ref="sendCoinScroll">
      <div class="wallet-name-num__wrapper">
        <div class="wallet-name">{{walletName}}</div>
        <div class="coin-num-name">
          <span class="coin-number">{{selectedCoin.balance|sts2btc(indivisibleAssetMode)}}</span>
          <span class="coin-name">{{selectedCoin.unit}}</span>
        </div>
      </div>
      <div class="send-to__text send__text" style="margin-top:24px">{{$t('send_to_address')}}</div>
      <div class="send-to__container">
        <div class="enter-reveive-address">
          <el-input v-model.trim="address" size="medium" :placeholder="$t('enter_receive_address')"></el-input>
        </div>
        <div class="scan-btn">
          <el-button size="small" @click="$emit('scan')">
            <img width="14" height="14" src="/images/icons/scan_s_16p@2x.png" alt />
          </el-button>
        </div>
      </div>

      <div v-if="indivisibleAssetMode">
        <div
          class="send-from__text send__text"
          style="margin:24px 0 12px"
        >{{$t('common_send_asset')}}</div>
        <el-select
          v-model="inpNum"
          :placeholder="$t('select_asset')"
          :no-match-text="$t('cannot_search_asset')"
          ref="selectFour"
          filterable
        >
          <el-option v-for="(item,index) in utxoList" :key="index" :value="item.amount">
            <div class="opt-container special">#&nbsp;{{item.amount}}</div>
          </el-option>
        </el-select>
      </div>

      <div v-else>
        <div class="amount__text send__text">
          <div>{{$t('common_amount')}}</div>
        </div>
        <el-input
          class="amount-input__container"
          v-model="inpNum"
          :placeholder="$t('hint_enter_amount')"
          type="number"
          :disabled="isVoteTx"
        >
          <template slot="append">{{selectedCoin.unit}}</template>
        </el-input>

        <div class="amount__text send__text" style="margin:0" v-if="sendCoinAmount">
          <div
            v-if="walletAssetError"
            class="amount-tip__text"
            style="margin-top:6px"
          >{{$t('send_error2')}}</div>
        </div>
      </div>
      <div class="send__text">
        <div class="contract_wrapper">
          <el-checkbox :label="$t('contract_deal_optional')" name="type" v-model="contractPanel"></el-checkbox>
          <div class="contractPanel" v-if="contractPanel">
            <div class="send-type-label">{{$t('txn_type')}}</div>
            <el-select
              v-model="sendType"
              :placeholder="$t('add_contact_coins_select')"
              ref="selectTwo"
            >
              <el-option
                v-for="item in sendOptions"
                :key="item.label"
                :label="$t(item.label)"
                :value="item.value"
              ></el-option>
            </el-select>
            <div class="send-data__text send__text">{{$t('common_data')}}</div>
            <div class="data-input">
              <el-input
                type="textarea"
                :rows="3"
                :placeholder="$t('enter_data')"
                v-model="contractData"
              ></el-input>
            </div>
          </div>
        </div>
      </div>
      <div class="send__text miner-fee">
        <div class="title">
          <div>{{$t('coin_send_fee')}}</div>
          <el-switch
            v-model="advancedOptions"
            :disabled="contractPanel"
            :inactive-text="$t('advanced_options')"
            :width="32"
          />
        </div>

        <div style="display:flex">
          <el-row style="width:100%">
            <el-col :span="18">
              <el-input v-model="fee" type="number" :disabled="!advancedOptions"></el-input>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="feeAsset"
                class="unit"
                ref="selectThree"
                :placeholder="$t('search_hint')"
              >
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
            <el-input
              v-model="gasLimit"
              :disabled="!contractPanel"
              :placeholder="$t('hint_enter_amount')"
              type="number"
            ></el-input>
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
    </div>
    <div class="bottom-panel">
      <div
        :class="{'disabled': !canClick, 'confirm-send__btn': true}"
        class="suc-active-btn"
        @click="handleConfirmAndSend"
      >{{$t('confirm_send')}}</div>
    </div>
  </ModalContainer>
</template>
<script>
import ModalContainer from "@components/ModalContainer.vue";
import ModalHeader from "@components/ModalHeader.vue";
import Wallets from "@service/wallets";
import Storage from "@service/storage";
import { CONSTANT } from "@/constant";
import { TranService } from "@service/transaction";
import { btc2sts, sts2btc, isIndivisibleAsset } from "@utils";
import { chain } from "@api/chain";
import Cache from "@service/cache";
import { DefaultFee } from "@asimovdev/asimovjs";
import * as txHelper from "@asimovdev/asimovjs/lib/utils/TxHelper";
import { mapGetters } from "vuex";
import BigNumber from "bignumber.js";

export default {
  name: "ModalSendCoin",
  components: {
    ModalContainer,
    ModalHeader
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    walletName: {
      type: String,
      required: true
    },
    assets: {
      type: Array,
      required: true,
      default: []
    },
    toAddr: {
      type: String
    }
  },
  data() {
    const proxyAssets = [];
    proxyAssets.push(CONSTANT.DEFAULT_COIN);
    const defaultFee = sts2btc(DefaultFee.amount);
    return {
      selfAddress: "",
      address: "",
      contractData: "",
      sendCoinAmount: "",
      wltInst: {},
      sendType: "",
      contractPanel: false,
      timer: null,
      sendOptions: [
        { label: "call_contract", value: "call" },
        { label: "create_contract", value: "create" },
        { label: "create_template", value: "template" },
        { label: "vote_transaction", value: "vote" }
      ],
      gasLimit: 21000,
      proxyGasLimit: 21000,
      advancedOptions: false,
      adviceIndex: 1,
      exchange: 1,
      fee: 0,
      feeAsset: 0,
      proxyAssets,
      blockHeight: 0,
      voteId: 0,
      voteValue: 0,
      defaultFee,
      autoFee: false,
      __ins: null,
      __outs: null
    };
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    async handleConfirmAndSend() {
      if (!this.canClick) {
        return;
      }

      const { ins, outs } = await this.generateInsAndOuts();

      if (ins.length) {
        const allUtxoSpendable = ins.every(utxo => utxo.spendable);
        if (!allUtxoSpendable) {
          this.$message({
            type: "warning",
            duration: 5000,
            message: this.$t("not_all_utxo_spendable_warn")
          });
          return;
        }
      }

      if (this.isVoteTx && ins.length === 0) {
        this.$message({
          type: "warning",
          duration: 3000,
          message: this.$t("no_utxo_to_vote")
        });
        return;
      }

      let tranBaseInfo = {
        amount: this.indivisibleAssetMode
          ? this.sendCoinAmount
          : btc2sts(this.sendCoinAmount),
        fee: {
          value: btc2sts(this.fee),
          name: this.proxyAssets[this.feeAsset].unit
        },
        fromAddress: this.selfAddress,
        recieveAddress: this.address,
        asset: this.selectedCoin.asset
      };

      this.$emit("confirm", {
        ins,
        outs,
        gasLimit: this.gasLimit || 21000,
        tranBaseInfo
      });
    },
    chooseFee(index = this.adviceIndex) {
      this.adviceIndex = index;
      this.fee = new BigNumber(this.adviceArr[index].amount)
        .times(this.exchange)
        .toString();
    },
    autoToggle() {
      this.timer = setTimeout(() => {
        const scrollObj = this.$refs.sendCoinScroll;
        scrollObj.addEventListener("scroll", () => {
          if (this.$refs.selectOne) {
            this.$refs.selectOne.blur();
          }
          if (this.$refs.selectTwo) {
            this.$refs.selectTwo.blur();
          }
          if (this.$refs.selectThree) {
            this.$refs.selectThree.blur();
          }
          if (this.$refs.selectFour) {
            this.$refs.selectFour.blur();
          }
        });
      }, 0);
    },
    async generateInsAndOuts() {
      this.wltInst = Wallets.getActiveWallet();

      const selectedCoin = this.selectedCoin;
      const assetObjArr = [];

      const sendAmount = this.indivisibleAssetMode
        ? this.sendCoinAmount
        : btc2sts(this.sendCoinAmount);

      assetObjArr.push({
        amount: new BigNumber(sendAmount).toString(),
        asset: selectedCoin.asset
      });
      if (this.autoFee) {
        assetObjArr.push({
          amount: new BigNumber(btc2sts(this.fee)).toString(),
          asset: this.proxyAssets[this.feeAsset].asset
        });
      }
      const { ins, changeOut } = await TranService.chooseUTXO(
        this.wltInst.walletId,
        assetObjArr,
        {
          isVoteTx: this.isVoteTx,
          balance: this.selectedCoin.balance,
          id: this.voteId,
          contractAddress: this.address
        }
      );
      let outs = [];
      if (ins.length) {
        const out = {
          amount: new BigNumber(
            this.indivisibleAssetMode
              ? this.sendCoinAmount
              : btc2sts(this.sendCoinAmount)
          ).toString(),
          assets: selectedCoin.asset,
          address: this.address,
          data: this.contractData,
          contractType: this.sendType
        };
        outs.push(out);
        if (changeOut.length) {
          outs = outs.concat(changeOut);
        }

        if (this.isVoteTx && outs.length) {
          this.voteValue = 0;
          for (let out of outs) {
            if (
              out.assets === this.selectedCoin.asset &&
              out.address === this.selfAddress
            ) {
              this.voteValue += out.amount;
            }
          }
        }
      }

      this.__ins = ins;
      this.__outs = outs;

      return { ins, outs };
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
    gasPlus(ins = this.__ins, outs = this.__outs) {
      try {
        if (new BigNumber(this.sendCoinAmount).gte(0)) {
          this.gasLimit = txHelper.estimateGas(ins, outs, this.proxyGasLimit);
        }
      } catch (e) {
        console.log(e);
      }
    }
  },
  computed: {
    canClick: function() {
      let minAmount = 1;
      let maxAmount = new BigNumber(this.selectedCoin.balance);
      let contractFlag = true;
      let verifyNumber = true;
      if (this.contractPanel) {
        minAmount = 0;
      }
      if (this.selectedCoin.asset === this.proxyAssets[this.feeAsset].asset) {
        maxAmount = maxAmount.minus(btc2sts(this.fee));
      }
      if (this.contractPanel) {
        contractFlag = this.gasLimit > 0 && this.sendType && this.contractData;
      }
      if (this.fee) {
        this.getEstimateGas;
      }

      if (!this.indivisibleAssetMode) {
        verifyNumber =
          this.sendCoinAmount &&
          btc2sts(this.sendCoinAmount) <= maxAmount.toString() &&
          btc2sts(this.sendCoinAmount) * CONSTANT.TOSATOSHI >= minAmount;
      }

      return (
        CONSTANT.ADDRESS_REG.test(this.address) &&
        this.sendCoinAmount &&
        verifyNumber &&
        this.fee &&
        btc2sts(this.fee) >= 1 &&
        new BigNumber(this.proxyAssets[this.feeAsset].balance).gte(
          btc2sts(this.fee)
        ) &&
        contractFlag
      );
    },
    inpNum: {
      get: function() {
        return this.sendCoinAmount;
      },
      set: function(newValue, oldValue) {
        if (newValue == "") {
          this.sendCoinAmount = 0;
        }
        if (!isNaN(newValue)) {
          this.sendCoinAmount =
            newValue == "" ? "" : new BigNumber(newValue).toString();
        }
      }
    },
    selectedCoin() {
      return (
        this.$store.state.wltState.selectedCoin ||
        this.$store.state.wltState.assets[0]
      );
    },
    indivisibleAssetMode() {
      return isIndivisibleAsset(this.selectedCoin.asset);
    },
    gasPrice() {
      this.feeMonitoring;
      let result = new BigNumber(btc2sts(this.fee)).div(
        Math.ceil(parseFloat(this.gasLimit)).toString()
      );
      if (!Number.isFinite(result)) {
        result = 0;
      }
      return result.toFixed(6);
    },
    walletAssetError() {
      return (
        btc2sts(this.sendCoinAmount) >
        this.selectedCoin.balance -
          (this.selectedCoin.asset === this.proxyAssets[this.feeAsset].asset
            ? btc2sts(this.fee)
            : 0)
      );
    },
    feeError() {
      const fee = new BigNumber(btc2sts(this.fee));
      return (
        this.indivisibleAssetMode &&
        fee.toString() &&
        fee.gt(this.proxyAssets[this.feeAsset].balance)
      );
    },
    getEstimateGas() {
      if (
        CONSTANT.ADDRESS_REG.test(this.address) &&
        parseInt(this.sendCoinAmount) >= 0 &&
        this.contractData &&
        this.sendType
      ) {
        chain
          .getEstimateGas([
            this.selfAddress,
            this.address,
            btc2sts(this.sendCoinAmount),
            this.selectedCoin.asset,
            this.contractData,
            this.sendType,
            this.voteValue || 0
          ])
          .then(
            res => {
              this.proxyGasLimit = this.gasLimit = Math.max(
                parseInt(res * 1.1),
                21000
              );
              return res;
            },
            err => {
              if (this.sendType && this.contractData) {
                this.proxyGasLimit = this.gasLimit = 10000000;
              } else {
                this.proxyGasLimit = this.gasLimit = 21000;
              }
            }
          )
          .finally(() => {
            this.gasPlus();
          });
      }
    },
    isVoteTx() {
      if (this.sendType === "vote") {
        this.voteId = parseInt(this.contractData.slice(-64), 16);
        this.sendCoinAmount = "0";
        return true;
      }
      this.sendCoinAmount = "";
      return false;
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
    ...mapGetters(["getSpecialUtxos"]),
    utxoList() {
      if (this.indivisibleAssetMode) {
        return this.getSpecialUtxos[this.selectedCoin.asset] || [];
      }
    }
  },
  asyncComputed: {
    async feeMonitoring() {
      if (
        CONSTANT.ADDRESS_REG.test(this.address) &&
        parseFloat(this.sendCoinAmount) >= 0 &&
        parseFloat(this.fee) >= 0
      ) {
        const { ins, outs } = await this.generateInsAndOuts();
        if (!this.advancedOptions) {
          this.defaultFee = sts2btc(
            txHelper.estimateFee(ins, outs, this.proxyGasLimit)
          );
          this.chooseFee();
        }
        this.autoFee = true;
        this.gasPlus();
      }
      return false;
    }
  },
  watch: {
    async visible(newVal, oldVal) {
      if (!newVal) {
        this.address = "";
        this.contractData = "";
        this.sendCoinAmount = "";
        this.sendType = "";
        this.contractPanel = false;
        this.fee = "";
        this.adviceIndex = 1;
        this.$refs.sendCoinScroll.scrollTo(0, 0);
        this.advancedOptions = false;
        this.gasLimit = 21000;
        this.proxyGasLimit = 21000;
        this.feeAsset = 0;
        this.blockHeight = 0;
        this.voteId = 0;
        clearTimeout(this.timer);
      } else {
        this.autoToggle();
        this.initFeeList();
        this.chooseFee(this.adviceIndex);
      }

      const allAddrs = await Storage.get("walletAddrs");
      const { walletId, name } = this.$store.state.wltState.info;
      this.walletName = name;
      this.selfAddress = allAddrs[walletId][0][0].address;
    },
    advancedOptions(newVal) {
      if (!newVal) {
        this.chooseFee(this.adviceIndex);
      }
    },
    contractPanel(newVal) {
      if (newVal) {
        this.advancedOptions = true;
        this.fee = "";
        this.proxyGasLimit = this.gasLimit = "";
      } else {
        this.sendType = "";
        this.contractData = "";
        this.proxyGasLimit = this.gasLimit = 21000;
      }
    },
    toAddr(newVal) {
      if (newVal) {
        this.address = newVal;
        this.$emit("clearToAddr");
      }
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
    }
  }
};
</script>
<style lang="scss">
.send-coin__container {
  padding: 0 32px;
  height: calc(100% - 124px);
  overflow: scroll;
  padding-bottom: 32px;
  .send__text {
    font-size: 12px;
    color: #646464;
    font-weight: 400;
  }

  .el-select {
    width: 100%;
  }

  .send-from__text {
    margin-top: 24px;
  }

  .send-to__text {
    margin-top: 34px;
  }

  .send-type-label {
    margin-top: 24px;
    margin-bottom: 12px;
  }

  .wallet-name-num__wrapper {
    margin-top: 22px;
    display: flex;
    font-size: 16px;
    font-weight: 500;

    .wallet-name {
      color: #282828;
      max-width: 210px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .coin-num-name {
      flex: 1;
      flex-shrink: 0;
      text-align: right;

      .coin-number {
        color: #0076ff;
      }

      .coin-name {
        color: #646464;
      }
    }
  }

  .send-to__container {
    display: flex;
    margin-top: 12px;

    .enter-reveive-address {
      flex: 1;
    }

    .scan-btn {
      margin-left: 12px;
    }
  }

  .amount__text {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;

    .amount-tip__text {
      color: #f84263;
    }
  }

  .around-equal-to {
    height: 40px;
    line-height: 35px;
    text-align: center;
    font-size: 18px;
    color: #9d9d9d;
    font-weight: 500;
  }

  .amount-input__container {
    margin-top: 12px;
  }

  .send-data__text {
    margin-top: 24px;
  }

  .data-input {
    margin-top: 12px;
    height: 80px;
    overflow-y: hidden;
  }

  .miner-fee {
    .warn-info {
      color: #f84263;
      font-size: 12px;
      line-height: 1;
      margin-top: 6px;
    }
    .title {
      margin: 24px 0 8px;
      display: flex;
      justify-content: space-between;
      span {
        color: #0076ff;
        font-size: 12px;
        float: left;
      }

      .el-switch {
        align-items: center;
        &.is-checked .el-switch__core::after {
          margin-left: -9px;
        }
        .el-switch__label {
          height: 12px;
          margin-right: 8px;
        }
        .el-switch__core {
          height: 12px;
          &::after {
            height: 8px;
            width: 8px;
          }
        }
      }
    }
    .advice {
      display: flex;
      justify-content: space-between;
      padding: 8px 0 0;
      .number {
        width: 128px;
        height: 44px;
        border: 1px solid #d3d3d3;
        border-radius: 4px;
        padding: 6px 0;
        cursor: pointer;
        transition: all 100ms;
        p {
          padding: 2px 0;
          font-size: 12px;
          text-align: center;
          &.amount {
            color: #000;
            font-weight: 600;
          }
        }
        &:hover .amount {
          color: #409eff;
        }
      }
      .choose {
        background: #0076ff !important;
        border-color: #0076ff !important;
        position: relative;
        p {
          color: #fff !important;
        }
        &::after {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          box-sizing: border-box;
          content: "";
          display: block;
          border: 4px solid;
          border-color: transparent transparent #0076ff transparent;
        }
      }
    }
    .gas {
      display: flex;
      .wrapper {
        width: 203px;
        p {
          margin: 8px 0;
        }
        input {
          height: 36px;
        }
      }
      .final {
        padding: 37px 0 0 20px;
        color: #9d9d9d;
      }
      .wrapper + .wrapper {
        margin-left: 8px;
      }
    }
    .el-row {
      border: 1px solid #d3d3d3;
      border-radius: 4px;
      overflow: hidden;
      input {
        border: none;
        border-radius: 0;
        height: 36px;
      }
    }
    .conversion {
      padding: 12px 0 0 20px;
      color: #9d9d9d;
    }
    .conversion,
    .final {
      position: relative;
      &::before {
        content: "≈";
        position: absolute;
        display: block;
        left: 8px;
        bottom: 14px;
      }
    }
    .unit {
      border-left: 1px solid #d3d3d3;
    }
  }

  .contract_wrapper {
    margin-top: 24px;
    border: 1px solid #e3e3e3;
    border-radius: 4px;
    padding: 13px 16px;
    .el-checkbox__label {
      font-size: 16px;
      color: #646464;
    }
  }
}

.el-select-dropdown__item {
  overflow: auto !important;
  height: auto !important;
  min-height: 34px;
}
.el-select-dropdown__item.selected .opt-container * {
  color: #0076ff;
}
.opt-container {
  height: 64px;
  padding: 16px;
  .address {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #000;
  }
  .detail {
    margin-top: 8px;
    .unit {
      color: #9d9d9d;
    }
    .amount {
      color: #0076ff;
    }
  }
}

.opt-container.special {
  height: 36px;
  padding: 0px;
  font-size: 12px;
  color: #282828;
  margin: 0 -4px;
  border-bottom: 1px solid #ededed;
}

.bottom-panel {
  position: absolute;
  left: 0;
  bottom: 0px;
  background: #fff;
  width: 100%;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;

  .confirm-send__btn {
    width: 320px;
    height: 48px;
    line-height: 48px;
    text-align: center;
    font-size: 16px;
    color: #fff;
    font-weight: 600;
    margin: 10px auto 10px;
    border-radius: 4px;
  }
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>

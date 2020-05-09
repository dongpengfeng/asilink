<template>
  <ModalContainer :visible="visible" :top="32" :width="61.5" :height="516">
    <ModalHeader
      slot="header"
      :title="$t('transaction_detail')"
      :icon_src="detail.selectedCoin.icon"
      @close="handleClose"
    ></ModalHeader>
    <div class="detail-container">
      <div class="title-number__wrapper">
        <div class="title">
          <fw-icon :path="switchDetail.icon"></fw-icon>
          &nbsp;{{$t( switchDetail.text)}}
          &nbsp;{{detail.selectedCoin.coinName}}
        </div>
        <div
          class="number"
          :class="switchDetail.number_class"
          :style="{fontSize:indivisibleAssetMode?'24px':'36px'}"
        >{{switchDetail.symbol}}&nbsp;{{indivisibleAssetMode?'#':''}}{{detail.trans.amount|sts2btc(indivisibleAssetMode)}}</div>
      </div>
      <template>
        <div class="send-from title-value__container copy" v-if="switchDetail.addr_1">
          <div class="title">{{$t(switchDetail.addr_from)}}</div>
          <div class="value">
            {{switchDetail.addr_1}}
            <img
              class="copy-icon"
              src="/images/icons/copy_blue.png"
              @click="handleCopy(switchDetail.addr_1,$event)"
            />
          </div>
        </div>
        <div class="send-from title-value__container" v-else>
          <div class="title">{{$t('contract_deal')}}</div>
        </div>
        <div class="recieve-wallet mt24 title-value__container">
          <div class="title">{{$t(switchDetail.wltName)}}</div>
          <div class="value">{{detail.walletName}}</div>
        </div>
        <div class="recieve-address mt24 title-value__container copy">
          <div class="title">{{$t(switchDetail.addr_to)}}</div>
          <div class="value">
            {{switchDetail.addr_2}}
            <img
              class="copy-icon"
              src="/images/icons/copy_blue.png"
              @click="handleCopy(switchDetail.addr_2,$event)"
            />
          </div>
        </div>
      </template>
      <div class="mt24 title-value__container" v-show="fee!==undefined">
        <div class="title">{{$t('coin_send_fee')}}</div>
        <div class="value">
          <span>{{fee|sts2btc}}</span>
          <span :style="{color: '#646464'}">{{feeName}}</span>
        </div>
      </div>
      <div class="mt24 title-value__container" v-if="detail.trans.blocktime">
        <div class="title">{{$t('common_date')}}</div>
        <div class="value">{{ detail.trans.blocktime | time }}</div>
      </div>
      <div class="mt24 title-value__container">
        <div class="title">{{$t('transaction_detail_confirmations')}}</div>
        <div
          class="value"
        >{{detail.trans.confirmations?detail.trans.confirmations:$t('common_confirming')}}</div>
      </div>
      <div class="mt24 title-value__container copy">
        <div class="title">{{$t('txn_id')}}</div>
        <div class="value-wrap value">
          {{detail.trans.txid}}
          <img
            class="copy-icon"
            src="/images/icons/copy_blue.png"
            @click="handleCopy(detail.trans.txid,$event)"
          />
        </div>
      </div>
    </div>
  </ModalContainer>
</template>
<script>
import ModalContainer from "@components/ModalContainer.vue";
import ModalHeader from "@components/ModalHeader.vue";
import handleClipboard from "@utils/clipboard";
import { CONSTANT } from "@/constant";
import Cache from "@service/cache";
import { isIndivisibleAsset } from "@utils";

export default {
  name: "ModalTransactionDetail",
  data() {
    return {
      assetsInfo: []
    };
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    detail: {
      trans: Object,
      selectedCoin: Object,
      walletName: String
    }
  },
  components: {
    ModalContainer,
    ModalHeader
  },
  computed: {
    switchDetail() {
      let detail_ = {};
      switch (this.detail.trans.type) {
        case 0:
          detail_ = {
            icon: "icons/record_recieve@2x.png",
            text: "coin_received",
            number_class: "receive-number",
            symbol: "+",
            addr_from: "common_from",
            wltName: "receive_wallet",
            addr_to: "coin_receive_address",
            addr_1: this.detail.trans.fromAddress,
            addr_2: this.detail.trans.recieveAddress
          };
          break;
        case 1:
          detail_ = {
            icon: "icons/record_send@2x.png",
            text: "coin_send",
            number_class: "send-number",
            symbol: "-",
            addr_from: "coin_receive_address",
            wltName: "common_from",
            addr_to: "send_address",
            addr_1: this.detail.trans.recieveAddress,
            addr_2: this.detail.trans.fromAddress
          };
          break;
        case 2:
          detail_ = {
            icon: "icons/record_move@2x.png",
            text: "txn_moved",
            number_class: "receive-number",
            symbol: "",
            addr_from: "common_from",
            wltName: "receive_wallet",
            addr_to: "coin_receive_address",
            addr_1: this.detail.trans.fromAddress,
            addr_2: this.detail.trans.recieveAddress
          };
          break;
      }
      return detail_;
    },
    fee() {
      let fee = 0;
      if (this.detail.trans.fee) {
        fee = this.detail.trans.fee.value || 0;
      } else {
        fee = undefined;
      }
      return fee;
    },
    feeName() {
      const { fee } = this.detail.trans;
      if (fee && fee.name) {
        return fee && fee.name;
      } else if (fee && fee.asset) {
        for (let asset of this.assetsInfo) {
          if (asset.asset === fee.asset) {
            return asset.symbol || asset.name;
          }
        }
      }
    },
    indivisibleAssetMode() {
      if (this.detail.selectedCoin.asset) {
        return isIndivisibleAsset(this.detail.selectedCoin.asset);
      } else {
        return false;
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleCopy(data, $event) {
      this.$message({
        message: this.$t("copy_success"),
        type: "success",
        duration: 2 * 1000
      });
      handleClipboard(data, $event);
    }
  },
  watch: {
    visible(value) {
      if (value) {
        this.assetsInfo = Cache.getAssetsInfo();
        this.assetsInfo.push(CONSTANT.DEFAULT_COIN);
      }
    }
  }
};
</script>
<style scoped lang="scss">
.detail-container {
  padding: 0 32px 32px 32px;
}

.title-number__wrapper {
  margin-top: 28px;
  padding-bottom: 48px;
  border-bottom: 0.55px solid #ededed;

  .title {
    text-align: center;
    height: 24px;
    line-height: 24px;
    font-size: 16px;
    font-weight: 500;
    color: #282828;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .number {
    margin-top: 16px;
    font-size: 36px;
    line-height: 1;
    font-weight: 500;
    text-align: center;
  }

  .receive-number {
    color: #02ba3d;
  }

  .send-number {
    color: #0076ff;
  }
}

.title-value__container {
  display: flex;
  justify-content: space-between;

  .title {
    font-size: 12px;
    line-height: 12px;
    color: #646464;
    font-weight: 500;
  }

  .value {
    text-align: right;
    font-size: 12px;
    line-height: 12px;
    color: #282828;
    width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value-wrap {
    text-align: right;
    font-size: 12px;
    line-height: 12px;
    color: #0076ff;
    width: 280px;
    word-break: break-all;
    word-wrap: break-word;
  }
}

.send-from {
  margin-top: 32px;
}

.copy {
  .value {
    color: #0076ff;
    position: relative;
    padding-right: 14px;
    img {
      position: absolute;
      width: 12px;
      height: 12px;
      right: 0px;
    }
  }
}

.copy-icon {
  cursor: pointer;
}

.mt24 {
  margin-top: 24px;
}

.mt32 {
  margin-top: 32px;
}

.recieve-wallet {
  margin-top: 24px;
}
</style>
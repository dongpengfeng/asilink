<template>
  <ModalContainer :visible="visible" :top="16" :height="548" :width="61.5">
    <ModalHeader
      slot="header"
      :title="$t('coin_receive_address')"
      :icon_src="data.selectedCoin.icon"
      @close="handleClose"
    />
    <div class="qrocde">
      <qrcode-vue :value="proxyAddress" v-if="data.address" :size="240" level="H"></qrcode-vue>
    </div>
    <div class="address">{{data.address}}</div>
    <div class="footer-btns">
      <div class="copy-btn btn active-btn" @click="handleCopy($event)">
        <img width="16" height="16" src="/images/icons/copy_s_16p@2x.png" alt />
        <span>{{$t('option_once')}}</span>
      </div>
      <div class="save-btn btn active-btn" @click="handleSaveImg">
        <img width="16" height="16" src="/images/icons/recieve_s_16p@2x.png" alt />
        <span>{{$t('save_qr')}}</span>
      </div>
    </div>
  </ModalContainer>
</template>
<script>
import ModalContainer from "@components/ModalContainer.vue";
import ModalHeader from "@components/ModalHeader.vue";
import QrcodeVue from "qrcode.vue";
import handleClipboard from "@utils/clipboard";
import { CONSTANT } from "@/constant";

export default {
  name: "ModalQrcode",
  props: {
    data: {
      selectedCoin: {
        type: Object,
        default: {
          icon: ""
        }
      },
      address: String
    },
    visible: {
      type: Boolean,
      required: true
    }
  },
  components: {
    ModalContainer,
    ModalHeader,
    QrcodeVue
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleCopy($event) {
      this.$message({
        message: this.$t("copy_success"),
        type: "success",
        duration: 3 * 1000
      });
      handleClipboard(this.data.address, $event);
    },
    handleSaveImg() {
      const canvas = document.getElementsByTagName("canvas")[0];
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const event = new MouseEvent("click");
      a.download = this.$t("common_address");
      a.href = url;
      a.dispatchEvent(event);
    }
  },
  computed: {
    proxyAddress() {
      let { address, selectedCoin } = this.data;
      return `Asim:${address}?token=${selectedCoin.coinName}&code=${selectedCoin.asset}`;
    }
  }
};
</script>
<style scoped lang="scss">
.qrocde {
  width: 240px;
  height: 240px;
  background: #ccc;
  margin: 0 auto;
  margin-top: 72px;
}

.address {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: #0076ff;
}

.footer-btns {
  display: flex;
  margin-top: 72px;
  justify-content: space-between;
  padding: 0 32px;

  .btn:hover {
    cursor: pointer;
  }

  > .btn {
    position: relative;
    width: 200px;
    height: 36px;
    line-height: 36px;
    border-radius: 4px;
    border: 1px solid #d3d3d3;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: #646464;

    > img {
      position: absolute;
      left: 12px;
      top: 10px;
    }
  }
}
</style>
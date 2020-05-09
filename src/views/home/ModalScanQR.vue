<template>
  <div class="scan_qr_container">
    <ModalContainer :visible="visible" :height="522" :width="61.5">
      <ModalHeader slot="header" :title="$t('scan_qr_code')" @close="handleClose" />
      <div class="body">
        <section class="camera">
          <div class="mask"></div>
          <qrcode-stream v-if="visible" @decode="onDecode" class="qrcode-camera"></qrcode-stream>
        </section>
        <el-button type="primary" class="upload primary-active-btn">
          {{$t('click_upload')}}
          <qrcode-capture @decode="onCapture" />
        </el-button>
      </div>
    </ModalContainer>
  </div>
</template>

<script>
import ModalContainer from "@components/ModalContainer.vue";
import ModalHeader from "@components/ModalHeader.vue";
import { QrcodeStream, QrcodeCapture } from "vue-qrcode-reader";

export default {
  name: "ModalScanQR",
  components: {
    ModalContainer,
    ModalHeader,
    QrcodeStream,
    QrcodeCapture
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      address: ""
    };
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    onDecode(decodedString) {
      this.address = decodedString;
    },
    onCapture(decodedString) {
      this.address = decodedString;
    }
  },
  watch: {
    address(newVal, oldVal) {
      if (newVal !== oldVal && newVal) {
        const addr = /0x[a-fA-f0-9]{42}/.exec(newVal)[0];
        this.$emit("scan", addr);
      }
    },
    visible(newVal) {
      if (!newVal) {
        this.address = "";
      }
    }
  }
};
</script>
<style lang="scss">
.scan_qr_container {
  .el-dialog--center {
    margin-top: 30px !important;
  }
  .icon-normal {
    opacity: 0;
  }
  .body {
    padding: 0 32px 24px;
    height: 466px;
    .camera {
      width: 380px;
      height: 380px;
      margin: 0 auto;
      background: #686868;
      overflow: hidden;
      position: relative;
      .mask {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 260px;
        height: 260px;
        z-index: 100;
        outline: 100px solid rgba($color: #000000, $alpha: 0.5);
      }
      video {
        transform: rotateY(-180deg) scale(1.4);
      }
    }
    .upload {
      display: block;
      margin: 20px auto;
      position: relative;
      overflow: hidden;
      background: #0076ff;
      border: none;
      width: 200px;
      input {
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
      }
    }
  }
}
</style>
<template>
  <fw-wallet-base class="fw-wallet-base">
    <fw-nav></fw-nav>
    <p class="title">{{$t('mnemonic_confirm')}}</p>
    <p class="desc">{{$t('mnemonic_confirm_desc')}}</p>
    <div class="mnemo-textarea textarea">
      <div class="mnemo" v-for="(text,i) of selectedArry" :key="i">{{text}}</div>
    </div>
    <div class="randoomTexts">
      <div
        v-for="(letter,i) in radomTexts"
        :key="i"
        :class="selectedArry.indexOf(letter) == -1 ? 'unselect': 'select'"
        @click="()=>{selectHandle(letter)}"
      >
        <p class="primary-active-btn">{{letter}}</p>
      </div>
    </div>
    <fw-button
      class="done-btn suc-active-btn"
      width="320"
      color="green"
      @click.native="doneHandle"
    >{{$t('common_confirm')}}</fw-button>
  </fw-wallet-base>
</template>

<script>
import WalletBase from "../back-template";
import Wallets from "@service/wallets";
import Storage from "@service/storage";
import { CONSTANT } from "@/constant";

export default {
  data() {
    return {
      menonicArry: [],
      selectedArry: []
    };
  },
  computed: {
    radomTexts() {
      let tpl = [];
      let len = this.menonicArry.length;
      for (;;) {
        let ran = Math.floor(Math.random() * len);
        if (tpl.indexOf(this.menonicArry[ran]) == -1) {
          tpl.push(this.menonicArry[ran]);
          if (tpl.length == len) {
            break;
          }
        }
      }
      return tpl;
    }
  },
  components: {
    "fw-wallet-base": WalletBase
  },
  methods: {
    async doneHandle() {
      if (this.selectedArry.join("") != this.menonicArry.join("")) {
        this.$message({
          message: this.$t("import_mw_invalid"),
          type: "error",
          duration: 3000
        });
        return;
      }

      let wltInst = Wallets.getActiveWallet();
      wltInst.backupFlag = true;
      await wltInst.storeWltInfo();
      this.$store.dispatch("setMnemonic", "");

      await Storage.set("walletLogStatus", false);
      this.$store.dispatch("setSelectedCoin", CONSTANT.DEFAULT_COIN);
      this.$router.replace("/");

      chrome.runtime.sendMessage({
        type: "HAD_FLOWMASK_LOGIN_OUT",
        result: {
          success: true
        }
      });
    },
    selectHandle(e) {
      let idx = this.selectedArry.indexOf(e);
      if (idx == -1) {
        this.selectedArry.push(e);
      } else {
        this.selectedArry.splice(idx, 1);
      }
    }
  },
  created() {
    this.menonicArry = this.$route.params.mnonArray || [];
  }
};
</script>

<style lang="scss" scoped>
@import "../@styles/index.scss";
.wallet-base.fw-wallet-base {
  padding-top: 16px;
  padding-bottom: 16px;
}
.textarea {
  border: 1px solid $light-gray !important;
  height: auto;
  min-height: 160px;
  max-height: 180px;
  width: 100%;
}
.randoomTexts {
  font-size: 16px;
  font-weight: $medium;
  margin-top: 8px;
  width: 100%;
  padding: 4px;
  div {
    width: 25%;
    padding: 4px;
    display: inline-block;
    box-sizing: border-box;
    p {
      text-align: center;
      line-height: 36px;
      height: 36px;
      background: #0076ff;
      border-radius: 2px;
      color: #fff !important;
      cursor: pointer;
    }
  }
  .select p {
    background: #d3d3d3;
    &:hover {
      background: #e2e1e1 !important;
    }
    &:active {
      background: #afafaf !important;
    }
  }
}
.mnemo {
  height: 36px;
  line-height: 36px;
  width: 25%;
  text-align: center;
  margin: 0;
  padding: 0;
  border: none;
}
</style>

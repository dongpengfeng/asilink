<template>
  <fw-wallet-base>
    <fw-nav></fw-nav>
    <p class="title">{{$t('set_password')}}</p>
    <p class="desc">{{$t('password_set')}}</p>
    <p class="sub-title">{{$t('common_password')}}</p>
    <el-input type="password" v-model="password" :placeholder="$t('password_limit')"></el-input>
    <p class="sub-title">{{$t('common_confirm_ps')}}</p>
    <el-input type="password" :placeholder="$t('hint_repeat_new_password')" v-model="repassword"></el-input>
    <fw-button
      class="next-btn primary-active-btn"
      width="216"
      color="blue"
      @click.native="nextHandle"
    >{{$t('Common_next')}}</fw-button>
  </fw-wallet-base>
</template>

<script>
import WalletBase from "../back-template";
import Wallet from "@classes/Wallet";
import { Message } from "element-ui";
import { CONSTANT } from "@/constant";
import Storage from "@service/storage";
import { getWalletName } from "@utils";

export default {
  data() {
    return {
      password: "",
      repassword: ""
    };
  },
  components: {
    "fw-wallet-base": WalletBase
  },
  methods: {
    async nextHandle() {
      if (!this.checkPassword()) {
        return;
      }
      let wallet = new Wallet();
      let allWalletInfo = (await Storage.get("walletInfo")) || {};
      allWalletInfo = Object.values(allWalletInfo);
      const walletName = getWalletName(allWalletInfo);

      await wallet.create({
        walletName,
        lang: this.$i18n.locale || "en",
        mnemonicLength: 12,
        pwd: this.password
      });

      let mnemonic = wallet.getMnemonic(this.password);
      this.$store.dispatch("setMnemonic", mnemonic);

      this.$router.push("show-mnemon");
    },
    checkPassword() {
      if (!this.password) {
        this.errorMsg(this.$t("common_input_ps"));
        return;
      }
      let reg = CONSTANT.PASSWORD_REG;
      if (!reg.test(this.password)) {
        this.errorMsg(this.$t("password_limit"));
        return;
      }
      if (this.password != this.repassword) {
        this.errorMsg(this.$t("toast_ps_not_match"));
        return;
      }
      return true;
    },
    errorMsg(msg) {
      Message({
        message: msg,
        type: "error",
        duration: 3000
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>


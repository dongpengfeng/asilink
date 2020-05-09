<template>
  <div id="login">
    <fw-icon path="icons/logo_m@2x.png"></fw-icon>
    <div class="welcome-view">
      <p>{{$t('welcome_back')}}</p>
      <p>{{$t('login_passwords')}}</p>
    </div>
    <div class="form-group">
      <el-input
        type="password"
        v-model="password"
        @keyup.13.native="loginHandle"
        :placeholder="$t('common_password')"
      ></el-input>
      <fw-button color="blue" class="primary-active-btn" width="320" @click.native="loginHandle">
        <template>{{$t('log_in')}}</template>
        <template slot="right">
          <fw-icon path="icons/login_s_16p@2x.png" size="small"></fw-icon>
        </template>
      </fw-button>
      <a
        @click="$router.push({ name: 'create-wallet', params: { showBackBtn: true }})"
      >{{$t('mn_login')}}</a>
    </div>
  </div>
</template>

<script>
import Storage from "@service/storage";
import Wallets from "@service/wallets";
export default {
  data: () => {
    return {
      password: ""
    };
  },
  methods: {
    async loginHandle() {
      if (!this.password) {
        this.showMsg(this.$t("common_pin_unlock_desc"));
        return;
      }
      let wltInst = Wallets.getActiveWallet();
      let verify = wltInst.validatePayPassword(this.password);
      if (!verify) {
        this.showMsg(this.$t("toast_incorrect_password"));
        return;
      }
      await Storage.set("walletLogStatus", false);
      this.$router.replace("/");
    },
    showMsg(msg) {
      this.$message({
        showClose: true,
        message: msg,
        type: "error"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../@styles/index.scss";
#login {
  @include bg("two");
  text-align: center;
  height: 580px;
  & > img {
    width: 149px;
    height: 40px;
    margin-top: 48px;
  }
  .welcome-view {
    margin-top: 84px;
    font-weight: $medium;
    color: $black;
    p:nth-child(1) {
      font-size: 36px;
    }
    p:nth-child(2) {
      font-size: 16px;
      margin-top: 16px;
    }
  }
  .form-group {
    width: 320px;
    margin: 144px auto 0;
    bottom: 144px;
    .el-input {
      margin-bottom: 24px;
    }
    button {
      margin-bottom: 32px;
    }
    a {
      color: $blue;
      font-size: 12px;
      font-weight: $medium;
    }
  }
}
</style>

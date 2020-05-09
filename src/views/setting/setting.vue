<template>
  <div class="setting-container">
    <fw-nav url="/">
      <template class="left-box" slot="left">
        <span>{{$t("general_settings")}}</span>
      </template>
      <template slot="right">
        <div class="logout-btn active-btn" @click="logoutHandle">{{$t('common_logout')}}</div>
      </template>
    </fw-nav>
    <div class="body">
      <ul class="link-button">
        <li>
          <router-link to="/setting/wallets" replace>{{$t('wallet_lists')}}</router-link>
        </li>
        <li>
          <router-link to="/setting/general" replace>{{$t('common_general')}}</router-link>
        </li>
        <li>
          <router-link to="/setting/about" replace>{{$t('me_about')}}</router-link>
        </li>
      </ul>
      <div class="content">
        <transition mode="out-in" appear>
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import Storage from "@service/storage";
export default {
  name: "setting",
  data() {
    return {};
  },
  methods: {
    async logoutHandle() {
      await Storage.set("walletLogStatus", true);
      this.$router.push("/login");
      chrome.runtime.sendMessage({
        type: "HAD_FLOWMASK_LOGIN_OUT",
        result: {
          success: true
        }
      });
    }
  }
};
</script>

<style lang="scss" >
@import "./setting.scss";
@import "../@styles/index.scss";
.nav-bar {
  padding: 0px 20px;
}
.left-box {
  img {
    margin-right: 20px;
  }
}
.logout-btn {
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  padding: 12px 24px;
  color: #646464;
  font-size: 12px;
  font-weight: 500;
}
</style>

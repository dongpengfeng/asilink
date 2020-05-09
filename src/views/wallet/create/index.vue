<template>
  <div id="create-wallet">
    <div class="flex">
      <fw-icon v-if="!showBackBtn" path="icons/logo_m@2x.png"></fw-icon>
      <fw-icon
        v-else
        class="back-btn"
        path="icons/back_s_24p@2x.png"
        @click.native="$router.go(-1)"
      ></fw-icon>

      <div class="lang _mark" @click="showLanguageBox=!showLanguageBox">
        <fw-icon path="icons/language@2x.png" class="_mark"></fw-icon>
        <span class="_mark">{{$t('me_language')}}</span>

        <div class="_container" v-show="showLanguageBox">
          <div class="item hover-cell" @click="handleChangeLanguage('zh')">
            <div class="_country">
              <img width="16" height="16" src="/images/countries/flag_icon_china.jpg" />
            </div>
            <div class="_name">
              <span>中文</span>
              <img
                v-show="lang === 'zh'"
                width="24"
                height="24"
                src="/images/icons/menu_coin_mark@2x.png"
              />
            </div>
          </div>
          <div class="item hover-cell" @click="handleChangeLanguage('en')">
            <div class="_country">
              <img width="24" height="24" src="/images/countries/flag_icon_unitedkingdom.jpg" />
            </div>
            <div class="_name">
              <span>English</span>
              <img
                v-show="lang === 'en'"
                width="16"
                height="16"
                src="/images/icons/menu_coin_mark@2x.png"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-group">
      <fw-button
        color="blue"
        class="primary-active-btn"
        width="320"
        @click.native="createNewWallet"
      >
        <template slot="left">
          <fw-icon path="icons/newwallet_s_16p_w@2x.png" size="small"></fw-icon>
        </template>
        <template>{{$t('start_new_wallet')}}</template>
        <template slot="right"></template>
      </fw-button>
      <fw-button color="white" class="active-btn" width="320" @click.native="importWallet">
        <template slot="left">
          <fw-icon path="icons/inputwallet_s_16p@2x.png" size="small"></fw-icon>
        </template>
        <template>{{$t('start_import_wallet')}}</template>
        <template slot="right"></template>
      </fw-button>
    </div>
    <div class="policy">
      {{$t('start_agree_terms', {value: ""})}}
      <span @click="UAModal=true">{{$t('me_about_terms')}}</span>
    </div>

    <ModalUserAgreement :visible="UAModal" @close="UAModal = !UAModal" />
  </div>
</template>

<script>
import Storage from "@service/storage.js";
import ModalUserAgreement from "@components/ModalUserAgreement";

export default {
  name: "create-wallet",
  components: {
    ModalUserAgreement
  },
  data() {
    return {
      showLanguageBox: false,
      lang: this.$i18n.locale,
      UAModal: false
    };
  },
  created() {
    window.addEventListener("click", this.closePanel);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.closePanel);
  },
  methods: {
    async createNewWallet() {
      this.$router.push({ name: "set-password" });
    },
    importWallet() {
      this.$router.push({ name: "import-wallet" });
    },
    async handleChangeLanguage(lang) {
      await Storage.set("lang", lang);
      this.lang = this.$i18n.locale = lang;
      this.showLanguageBox = false;
    },
    closePanel($event) {
      if ($event.target.className.indexOf("_mark") < 0) {
        this.showLanguageBox = false;
      }
    }
  },
  computed: {
    showBackBtn() {
      return this.$route.params.showBackBtn;
    }
  }
};
</script>

<style lang="scss">
@import "../@styles/index.scss";
#create-wallet {
  @include bg("one");
  height: 580px;
  .flex {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 48px 48px 0;
    & > img {
      width: 149px;
      height: 40px;
    }
    .lang {
      height: 24px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      position: relative;
      img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }
      span {
        font-size: 14px;
      }
    }
  }
  ._container {
    width: 280px;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
    background-color: #fff;
    position: absolute;
    right: 0;
    top: 32px;
    z-index: 1;

    .item {
      height: 48px;
      display: flex;
      align-items: center;
      padding-right: 16px;
      cursor: pointer;
      ._country {
        flex: 0 0 56px;
        height: 48px;
        padding: 12px 0;
        text-align: center;
        img {
          width: 24px;
          height: 24px;
        }
      }
      ._name {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 48px;
        line-height: 48px;
        border-bottom: 1px solid #ededed;
        font-size: 16px;
        color: #282828;
        font-weight: 500;
      }
    }
    &:last-child {
      border: none;
    }
  }
  .back-btn {
    width: 30px !important;
    height: 30px !important;
    cursor: pointer;
  }
  .btn-group {
    position: absolute;
    bottom: 84px;
    transform: translateX(-50%);
    left: 50%;
    button {
      margin-top: 24px;
    }
  }
  .policy {
    position: absolute;
    bottom: 24px;
    width: 100%;
    text-align: center;
    span {
      cursor: pointer;
      color: #0076ff;
    }
  }
}
</style>

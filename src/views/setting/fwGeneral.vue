<template>
  <div class="general-container">
    <fw-item @click.native.stop="handleShowSelectLanguage">
      <template slot="left">
        <div class="left">
          <fw-icon path="icons/language@2x.png"></fw-icon>
          <div>{{$t('me_language')}}</div>
        </div>
      </template>
      <template slot="right">
        <select v-model="lang"></select>
      </template>

      <div class="_container" v-show="showLanguageBox">
        <div class="item hover-cell" @click="handleChangeLanguage('zh')">
          <div class="_country">
            <img src="/images/countries/flag_icon_china.jpg" />
          </div>
          <div class="_name">
            <span>中文</span>
            <img
              v-show="lang === 'zh'"
              width="16"
              height="16"
              src="/images/icons/menu_coin_mark@2x.png"
            />
          </div>
        </div>
        <div class="item hover-cell" @click="handleChangeLanguage('en')">
          <div class="_country">
            <img src="/images/countries/flag_icon_unitedkingdom.jpg" />
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
    </fw-item>
    <fw-item class="curr" @click.native.stop="handleShowSelectCurrency">
      <template slot="left">
        <div class="left">
          <fw-icon path="icons/currency@2x.png"></fw-icon>
          <div>{{$t('me_currency')}}</div>
        </div>
      </template>
      <template slot="right">
        <select v-model="curr"></select>
      </template>

      <div class="_container" v-show="showCurrencyBox">
        <div
          class="item hover-cell"
          v-for="(item,index) in currencys"
          :key="index"
          @click="handleChangeCurrency(item.symbol)"
        >
          <div class="_country">
            <img :src="(`/images/countries/${item.icon}`)" />
          </div>
          <div class="_name">
            <span>{{$t(`currency_${item.symbol.toLowerCase()}`)}}</span>
            <img
              v-show="item.symbol === currency"
              width="16"
              height="16"
              src="/images/icons/menu_coin_mark@2x.png"
            />
          </div>
        </div>
      </div>
    </fw-item>
  </div>
</template>

<script>
import Storage from "@service/storage.js";
import Cache from "@service/cache";
import { CONSTANT } from "@/constant";

export default {
  name: "general",
  data() {
    return {
      lang: "",
      curr: "1",
      showLanguageBox: false,
      showCurrencyBox: false,
      currency: Cache.getCurrency(),
      currencys: CONSTANT.CURRENCY_DETAIL
    };
  },
  created() {
    this.lang = this.$i18n.locale;
    window.addEventListener("click", this.closePanel);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.closePanel);
  },
  methods: {
    handleShowSelectLanguage() {
      this.showLanguageBox = !this.showLanguageBox;
      this.showCurrencyBox = false;
    },
    handleShowSelectCurrency() {
      this.showCurrencyBox = !this.showCurrencyBox;
      this.showLanguageBox = false;
    },
    async handleChangeLanguage(lang) {
      await Storage.set("lang", lang);
      this.lang = this.$i18n.locale = lang;
      this.showLanguageBox = false;
    },
    async handleChangeCurrency(currency) {
      this.currency = currency;
      await Cache.setCurrency(this.currency);
    },
    closePanel($event) {
      if ($event.target.className.indexOf("fw-item") < 0) {
        this.showLanguageBox = false;
        this.showCurrencyBox = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped >
.general-container {
  .fw-item {
    background: white;
    width: 528px;
    padding: 16px;
    height: 80px;
    border: 1px solid #ededed;
    border-radius: 4px;

    .left {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #282828;
      img {
        margin: 16px;
      }
    }
    select {
      cursor: pointer;
      width: 12px;
      height: 12px;
      margin-right: 16px;
      appearance: none;
      background: url("/images/icons/dropdown_l@2x.png") no-repeat 0/ 12px;
      border: none;
      outline: none;
    }
  }
  .fw-item.curr {
    margin-top: 16px;
  }

  ._container {
    width: 280px;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50px;
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
        text-align: center;
        padding: 12px 0;
        img {
          width: 24px;
          height: 24px;
          margin: 0;
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
}
</style>

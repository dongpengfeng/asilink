<template>
  <div class="fw-coin-select">
    <fw-icon :path="'coins/coin_icon_'+ (selectedCoin.icon || 'default') +'.jpg'"></fw-icon>
    <button @click="handleClickCoin">
      <span class="coin-name">{{selectedCoin.coinName}}</span>
      <fw-icon path="icons/dropdown_l@2x.png" size="small"></fw-icon>
    </button>
    <div class="right">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "fw-coin-select",
  data() {
    return {};
  },
  props: {
    selectedCoin: {
      type: Object,
      default: {}
    }
  },
  methods: {
    handleClickCoin() {
      this.$emit("click");
    }
  },
  computed: {}
};
</script>
<style lang="scss" scoped>
@import "../@styles/index.scss";

.fw-coin-select {
  @include flex;
  justify-content: flex-start;
  & > img {
    margin-right: 8px;
  }

  & > button {
    @include flex;
    display: inline-block;
    height: 36px;
    min-width: 88px;
    padding: 0px 10px;
    border-radius: 4px;
    background-color: rgba(211, 211, 211, 0.3);
    cursor: pointer;
    text-decoration: none;
    outline: none;
    border: 0;

    .coin-name {
      margin-right: 23px;
      font-size: 16px;
      font-weight: $medium;
      color: $black;
      flex: 1;
    }
  }

  .right {
    flex-grow: 1;
  }
}
</style>
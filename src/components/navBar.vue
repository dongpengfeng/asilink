<template>
  <fw-item class="nav-bar">
    <template slot="left">
      <fw-icon
        v-if="!hideNavback"
        class="back-btn"
        path="icons/back_s_24p@2x.png"
        @click.native="backHandle"
      ></fw-icon>
      <slot name="left"></slot>
    </template>
    <template slot="center">
      <slot name="center"></slot>
    </template>
    <template slot="right">
      <slot name="right"></slot>
    </template>
  </fw-item>
</template>
<script>
export default {
  name: "fw-nav",
  props: ["hideNavback", "url"],
  methods: {
    backHandle() {
      if (this.url) {
        this.$router.replace(this.url);
      } else {
        this.$router.back();
      }
    }
  }
};
</script>
<style lang="scss">
@import "../@styles/index.scss";

.fw-item.nav-bar {
  background: #fff;
  height: 64px;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
  cursor: auto;
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
  }
  .back-btn {
    margin-right: 20px;
    cursor: pointer;
  }
  .right {
    cursor: pointer;
  }

  img,
  span {
    vertical-align: middle;
  }

  span {
    font-size: 16px;
    font-weight: $medium;
    color: $black;
  }
}
</style>
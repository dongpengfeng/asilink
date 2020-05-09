<template>
  <div class="fw-item" @click="emitClick">
    <div>
      <slot name="left"></slot>
    </div>
    <div class="center">
      <slot name="center"></slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
    <slot></slot>
    <div class="line" v-if="line"></div>
  </div>
</template>
<script>
export default {
  name: "fw-item",
  props: {
    line: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    emitClick() {
      this.$emit("click");
    }
  }
};
</script>
<style lang="scss">
@import "../@styles/index.scss";

.fw-item {
  @include flex;

  img {
    margin: 16px 0px;
  }

  position: relative;
  padding-right: 16px;
  height: 59px;
  cursor: pointer;
  .center {
    flex-grow: 1;
  }

  .line {
    position: absolute;
    bottom: 0;
    height: 1px;
    background: #ededed;
    left: 56px;
    right: 16px;
  }
}
</style>
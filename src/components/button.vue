<template>
  <button :style="{width: width + 'px'}" :class="bgColor">
    <span>
      <slot name="left"></slot>
    </span>
    <span>
      <slot></slot>
    </span>
    <span>
      <slot name="right"></slot>
    </span>
  </button>
</template>

<script>
export default {
  name: "fw-button",
  props: ["color", "width"],
  computed: {
    bgColor: function() {
      return this.color + "-btn";
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../@styles/index.scss";
button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  outline: none;
}

.left {
  float: left;
}

.right {
  float: right;
}

.blue-btn {
  @include colorBtn($blue, $white);
}
.white-btn {
  @include colorBtn($white, $second-text-color);
}
.green-btn {
  @include colorBtn($green, $white);
}
</style>


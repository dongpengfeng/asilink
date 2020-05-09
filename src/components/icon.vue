<template>
  <img :src="'/images/' + path" alt v-bind:class="className" />
</template>

<script>
export default {
  name: "fw-icon",
  props: ["path", "size"],
  computed: {
    className: function() {
      return "icon-" + (this.size || "normal");
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.icon-x-small {
  width: 12px;
  height: 12px;
}
.icon-small {
  width: 16px;
  height: 16px;
}
.icon-normal {
  width: 24px;
  height: 24px;
}
</style>

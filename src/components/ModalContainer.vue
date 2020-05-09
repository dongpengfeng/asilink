<template>
  <el-dialog
    class="flow-dilog__wrapper"
    :visible="visible"
    :width="width+'%'"
    center
    :top="top+'px'"
  >
    <div class="content__container" :style="{height: height + 'px'}">
      <slot name="header"></slot>
      <slot></slot>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "ModalContainer",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    width: {
      type: Number,
      default: 50
    },
    height: {
      type: Number,
      default: 452
    },
    top: {
      type: Number,
      default: 64
    }
  },

  data() {
    return {};
  },
  created() {}
};
</script>
<style lang="scss" scoped>
.flow-dilog__wrapper {
  position: absolute;
}

.el-dialog__title {
  display: none;
}

.content__container {
  width: 100%;
  border-radius: 4px;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  margin: 0 auto;
  background: #fff;
}
</style>
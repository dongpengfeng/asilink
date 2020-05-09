<template>
  <div class="flow-dialog__header">
    <fw-icon v-if="showIcon" :path="'coins/coin_icon_'+ (icon_src || 'default') +'.jpg'"></fw-icon>
    <span class="title" :class="!showIcon?'no-icon':''">{{title}}</span>
    <img
      class="icon-close"
      @click="$emit('close')"
      width="24"
      height="24"
      src="@static/images/icons/close_s_24p@2x.png"
      alt
    />
  </div>
</template>
<script>
export default {
  name: "ModalHeader",
  props: {
    title: {
      type: String,
      required: true
    },
    icon_src: {
      type: String,
      required: false
    },
    showIcon: {
      type: Boolean,
      default: true
    }
  }
};
</script>
<style scoped lang="scss">
.flow-dialog__header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    display: inline-block;
    width: 100%;
    text-align: center;

    font-size: 16px;
    font-weight: 500;
    color: #000;

    &.no-icon {
      padding-left: 24px;
    }
  }

  .icon-close {
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
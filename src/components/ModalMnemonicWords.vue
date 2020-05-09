<template>
  <el-dialog class="flow-dilog__wrapper" :visible="visible" width="416px" center>
    <div class="content__container" :style="{height: height + 'px'}">
      <div class="mnemonic-words__container">
        <span class="word" v-for="(word, index) in words" :key="index">{{word}}</span>
      </div>
      <div class="close-btn active-btn" @click="$emit('close')">{{$t('common_close')}}</div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "ModalMnemonicWords",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    height: {
      type: Number,
      default: 276
    },
    words: {
      type: Array
    }
  }
};
</script>
<style lang="scss" scoped>
.flow-dilog__wrapper {
  position: absolute;
}

.content__container {
  width: 100%;
  border-radius: 4px;
  position: absolute;
  left: 0;
  top: 0;
  background: #fff;

  padding: 32px;
  .mnemonic-words__container {
    overflow: hidden;
    .word {
      margin-right: 24px;
      height: 48px;
      line-height: 48px;
      float: left;
      font-size: 16px;
      color: #0076ff;
      font-weight: 600;
    }
  }
  .close-btn {
    position: absolute;
    left: 50%;
    transform: translateX(-96px);
    bottom: 32px;
    width: 192px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    font-size: 12px;
    color: #646464;
    font-weight: 500;
    border: 1px solid #c9c9c9;
    margin: 32px auto 0;
    border-radius: 4px;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
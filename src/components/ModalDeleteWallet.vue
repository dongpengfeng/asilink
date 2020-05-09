<template>
  <el-dialog class="flow-dilog__wrapper" :visible="visible" width="416px" center>
    <div class="content__container" :style="{height: height + 'px'}">
      <div class="title">{{$t('me_wallet_delete')}}</div>
      <div class="tips">{{$t('me_wallet_delete_desc2')}}</div>
      <div class="footer-btns">
        <div class="btn btn-cancel active-btn" @click="$emit('close')">{{$t('common_cancel')}}</div>
        <div class="btn btn-save error-active-btn" @click="$emit('delete')">{{$t('common_delete')}}</div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "ModalDeleteWallet",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    height: {
      type: Number,
      default: 212
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
  .title {
    font-size: 20px;
    color: #282828;
    font-weight: 500;
  }
  .tips {
    margin-top: 12px;
    color: #f84263;
    font-size: 12px;
  }

  .footer-btns {
    display: flex;
    justify-content: space-between;

    .btn {
      width: 168px;
      height: 48px;
      line-height: 48px;
      box-sizing: border-box;
      font-size: 16px;
      font-weight: 500;
      border-radius: 4px;
      text-align: center;
      margin-top: 48px;
      &:hover {
        cursor: pointer;
      }
    }
    .btn-cancel {
      color: #646464;
      border: 1px solid #c9c9c9;
    }
    .btn-save {
      background-color: #f84263;
      color: #fff;
    }
  }
}
</style>
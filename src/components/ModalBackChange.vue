<template>
  <el-dialog class="flow-dilog__wrapper" :visible="visible" width="416px" center>
    <div class="content__container">
      <div class="title">{{$t('common_notice')}}</div>
      <p class="tips">{{$t('warn_change_wallet')}}</p>
      <div class="footer-btns">
        <div class="btn btn-cancel active-btn" @click="$router.go(-1)">{{$t('common_cancel')}}</div>
        <div
          class="btn btn-save suc-active-btn"
          @click="$router.replace({name:'home',params:{changeWallet:true}})"
        >{{$t('common_confirm')}}</div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "ModalBackChange",
  props: {
    visible: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {};
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
    font-size: 12px;
    color: #282828;
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
      background-color: #02ba3d;
      color: #fff;
    }
  }
}
</style>
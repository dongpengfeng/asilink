<template>
  <el-dialog class="flow-dilog__wrapper" :visible="visible" width="416px" center>
    <div class="content__container" :style="{height: height + 'px'}">
      <div class="title">{{$t('edit_name_waller')}}</div>
      <el-input class="input" :placeholder="$t('edit_name_waller')" v-model="name"></el-input>
      <div class="footer-btns">
        <div class="btn btn-cancel active-btn" @click="$emit('close')">{{$t('common_cancel')}}</div>
        <div class="btn btn-save suc-active-btn" @click="handleSave">{{$t('common_sace')}}</div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "ModalEditWalletName",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    height: {
      type: Number,
      default: 252
    },
    walletName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      name: ""
    };
  },
  created() {
    this.name = this.walletName;
  },
  methods: {
    handleSave() {
      this.$emit("save", this.name);
    }
  },
  watch: {
    walletName(newVal, oldVal) {
      this.name = newVal;
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
  /*height: 592px;*/
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
  .input {
    margin-top: 24px;
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
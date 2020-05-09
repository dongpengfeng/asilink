<template>
  <el-dialog class="flow-dilog__wrapper" :visible="visible" width="416px" center>
    <div class="content__container" :style="{height: height + 'px'}">
      <div class="title">{{$t('verify_password')}}</div>
      <div class="tips">{{$t(tip)}}</div>
      <el-input
        class="input"
        type="password"
        :placeholder="$t('common_input_ps')"
        v-model="password"
        ref="input"
      ></el-input>

      <div class="footer-btns">
        <div class="btn btn-cancel active-btn" @click="handleCancel">{{$t('common_cancel')}}</div>
        <div
          class="btn btn-save suc-active-btn"
          @click="handleConfirm"
          :class="{disabled:password.length<8}"
        >{{$t('common_confirm')}}</div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "ModalAuthPassword",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    height: {
      type: Number,
      default: 272
    },
    tip: {
      type: String,
      default: "common_confirm_pw"
    }
  },

  data() {
    return {
      password: ""
    };
  },
  methods: {
    handleConfirm() {
      if (this.password.length < 8) {
        return;
      }
      this.$emit("confirm", this.password);
      this.password = "";
    },
    handleCancel() {
      this.$emit("close");
      this.password = "";
    }
  },
  watch: {
    visible(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      }
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
    color: #282828;
    font-size: 12px;
  }

  .input {
    margin-top: 12px;
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
      color: #fff;
    }
  }
}
</style>
<template>
  <el-dialog
    class="flow-dilog__wrapper"
    :visible="visible"
    top="64px"
    :width="width+'px'"
    center
    :modal-append-to-body="true"
    :append-to-body="true"
    :show-close="false"
  >
    <span slot="title" class="flow-dilog_title">{{title}}</span>
    <slot></slot>
    <div slot="footer" class="flow-dilog_btn_group">
      <el-button
        class="fw-button white-btn active-btn"
        style="width:168px"
        color="white"
        @click="handleCancel"
      >{{$t("common_cancel")}}</el-button>
      <el-button
        class="fw-button green-btn suc-active-btn"
        style="width:168px"
        color="green"
        @click="handleConfirm"
      >{{$t("common_confirm")}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "fw-dialog",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    width: {
      type: Number,
      default: 416
    },
    title: {
      type: String,
      default: ""
    }
  },

  data() {
    return {};
  },
  created() {},
  methods: {
    handleCancel() {
      this.$emit("update:visible", false);
    },
    handleConfirm() {
      this.$emit("confirm");
    }
  }
};
</script>
<style lang="scss">
.flow-dilog__wrapper {
  .el-dialog__header,
  .el-dialog__body,
  .el-dialog__footer {
    padding-left: 32px;
    padding-right: 32px;
    padding-bottom: 0;
    padding-top: 0;
  }

  .el-dialog__header {
    padding-top: 32px;
    padding-bottom: 24px;
    text-align: left;
  }

  .flow-dilog_title {
    font-weight: bold;
    font-size: 20px;
    color: #282828;
    line-height: 20px;
  }

  .el-dialog__footer {
    padding-top: 48px;
    padding-bottom: 32px;
  }

  .flow-dilog_btn_group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
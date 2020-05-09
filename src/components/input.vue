<template>
  <el-input class="fw-input"></el-input>
</template>
<script>
export default {
  name: "fw-input"
};
</script>
<style lang="scss" scoped>
.fw-input {
  .el-input {
    .el-input__inner {
      height: 36px;
      line-height: 36px;
      background-color: #fbfbfb;
      font-size: 12px;
    }
  }

  .el-button {
    width: 72px;
    height: 36px;
    margin-left: 12px;
  }
}
</style>
<template>
  <div class="fw-select" @click.stop="handleToggle">
    <div class="fw-select-wrap" :class="{'ia-mode':IAMode}">
      <slot name="prefix"></slot>
      <span class="number" v-if="IAMode">{{selected.balance}}&nbsp;</span>
      <span class="name">{{selected.name}}</span>
      <fw-icon class="arrow-down" path="icons/dropdown_l@2x.png"></fw-icon>
    </div>
    <transition name="el-zoom-in-top">
      <div v-if="visible" class="option-container">
        <slot name="options"></slot>
        <div
          v-for="(option,index) in options"
          :key="index"
          @click.stop="handleSelect(option,$event)"
        >{{option.name}}</div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  name: "fw-select",
  props: {
    color: String,
    selected: {
      type: Object,
      default: {}
    },
    options: Array,
    popperAppendToBody: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    // Indivisible asset mode
    IAMode: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleSelect(selected, event) {
      this.$emit("selected", selected);
    },
    handleToggle() {
      this.$emit("changeVisible");
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../@styles/index.scss";

.fw-select {
  position: relative;

  .fw-select-wrap {
    display: flex;
    align-items: center;
    background-color: rgba(211, 211, 211, 0.3);
    border-radius: 4px;
    color: #282828;
    height: 32px;
    padding: 10px;
    cursor: pointer;
  }

  .ia-mode {
    color: #0076ff;
    font-weight: 450;
  }

  .name {
    font-size: 12px;
    flex-grow: 1;
  }

  .arrow-down {
    margin-left: 43px;
    width: 12px;
    height: 12px;
  }

  .option-container {
    position: absolute;
    top: 0;
    left: 0;
    margin-top: 50px;
    background-color: #fff;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
}
</style>
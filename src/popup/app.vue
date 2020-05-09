<template>
  <div id="popupApp">
    <router-view />
  </div>
</template>
<style lang="scss">
#popupApp {
  position: relative;
  height: 100%;
  min-height: 100%;
  &::-webkit-scrollbar {
    background-color: transparent;
  }
}
</style>
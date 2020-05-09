<template>
  <ModalContainer :visible="visible" :top="16" :height="548" :width="61.5">
    <ModalHeader slot="header" :title="$t('ua_title')" :showIcon="false" @close="handleClose" />
    <article class="user-agreement">
      <section v-for="(section,key) in article" :key="key">
        <h4>{{$t('ua_title_'+section.title)}}</h4>
        <div v-for="(content,index) in section.content" :key="index">
          <div v-if="content.title">
            <h5>{{$t('ua_content_'+content.title)}}</h5>
            <p>{{$t('ua_content_'+ content.content)}}</p>
          </div>
          <p v-else>{{$t('ua_content_'+ content)}}</p>
        </div>
      </section>
    </article>
  </ModalContainer>
</template>
<script>
import ModalContainer from "@components/ModalContainer.vue";
import ModalHeader from "@components/ModalHeader.vue";

export default {
  name: "ModalUserAgreement",
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  components: {
    ModalContainer,
    ModalHeader
  },
  data() {
    return {
      article: [
        { title: 1, content: [1] },
        { title: 2, content: [2, 3, 4, 5, 6, 7] },
        {
          title: 3,
          content: [
            { title: 8, content: 9 },
            { title: 10, content: 11 },
            { title: 12, content: 13 },
            { title: 14, content: 15 },
            { title: 16, content: 17 },
            { title: 18, content: 19 },
            { title: 20, content: 21 },
            { title: 22, content: 23 }
          ]
        },
        { title: 4, content: [24, 25, 26, 27, 28, 29, 30] },
        { title: 5, content: [31, 32, 33, 34] },
        { title: 6, content: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45] },
        { title: 7, content: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56] },
        { title: 8, content: [57, 58, 59] },
        { title: 9, content: [60] },
        { title: 10, content: [61] }
      ]
    };
  },
  methods: {
    handleClose() {
      this.$emit("close");
    }
  }
};
</script>
<style scoped lang="scss">
.user-agreement {
  height: 480px;
  overflow-y: auto;
  color: #282828;
  padding: 0 24px;
  text-align: justify;
  word-break: break-word;
  h4 {
    margin: 6px 0 10px;
    font-size: 24px;
    font-weight: 700;
    line-height: 36px;
  }
  h5 {
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    margin: 8px 0 4px;
  }
  p {
    font-size: 14px;
    line-height: 22px;
    margin: 4px 0;
  }
  section + section h4 {
    margin-top: 18px;
  }
}
</style>
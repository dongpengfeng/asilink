
<template>
  <ModalContainer :visible="visible" :top="16" :height="548" :width="61.5">
    <ModalHeader slot="header" :title="$t('pc_title')" :showIcon="false" @close="handleClose" />
    <article class="privacy-policy">
      <section>
        <p>
          <span>{{$t('pc_content_2_1')}}</span>
          <span class="emil">feedback@asimov.network</span>
          <span>{{$t('pc_content_2_2')}}</span>
        </p>
      </section>
      <section v-for="(section,key) in article" :key="key">
        <h4>{{$t('pc_title_'+section.title)}}</h4>
        <p v-for="(p,index) in section.content" :key="index">{{$t('pc_content_'+ p)}}</p>
      </section>
    </article>
  </ModalContainer>
</template>
<script>
import ModalContainer from "@components/ModalContainer.vue";
import ModalHeader from "@components/ModalHeader.vue";

export default {
  name: "ModalPrivacyPolicy",
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
        { title: 1, content: [3, 4] },
        { title: 2, content: [5] },
        {
          title: 3,
          content: [
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27
          ]
        },
        { title: 4, content: [28, 29, 30, 31, 32, 33] },
        { title: 5, content: [34, 35] },
        { title: 6, content: [36, 37] },
        { title: 7, content: [38, 39, 40, 41] }
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
.privacy-policy {
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
  p {
    font-size: 14px;
    line-height: 22px;
    margin: 4px 0;
  }
  section + section h4 {
    margin-top: 18px;
  }
  .emil {
    text-decoration: underline;
  }
}
</style>

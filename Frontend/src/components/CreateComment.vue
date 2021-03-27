<template>
  <form class="formComment" name="formComment">
    <!-- Textarea du commentaire -->
    <textarea
      name="comment"
      class="form-control"
      cols="130"
      rows="2"
      required
      placeholder="Créer un commentaire"
      aria-label="Ecrire un commentaire"
      v-model="content"
      v-on:input="sendComment"
    ></textarea>
    <!-- Fin -->
    <!-- Bouton pour le publier -->
    <slot></slot>
    <!-- fin -->
  </form>
</template>

<script>
export default {
  name: "CreateComment",
  data: () => {
    return {
      content: "",
    };
  },
  methods: {
    sendComment() { // Envois du corps du commentaire au parent pour traiter l'envoi à l'api
      this.$emit("comment-sent", this.$data);
    },
  },
};
</script>

<style scoped lang="scss">
.formComment {
  display: flex;
}
</style>
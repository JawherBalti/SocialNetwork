<template>
  <div class="mb-4">
    <form name="createPost">
      <!-- Textarea du post -->
      <textarea
        name="content"
        class="form-control mb-2"
        cols="130"
        rows="3"
        maxlength="180"
        placeholder="Créer un post"
        aria-label="Ecrire un post"
        v-model="content"
      ></textarea>
      <!-- Fin -->
      <!-- Sélection du Gif -->
      <div class="row">
        <div class="input-group mb-2 col-sm">
          <label class="file-button">
            Choisir un fichier
            <span>
              <input
                name="imageurl"
                type="file"
                class="image-selector"
                v-on:change="sendFile($event)"
              />
            </span>
          </label>
        </div>

        <!-- Fin -->
        <!-- Bouton pour le publier -->
        <div class="publish form-group btn-lg float-end">
          <button
            class="btn btn-primary pointer"
            type="submit"
            v-on:click.prevent="sendPost()"
          >
            Publier
          </button>
        </div>
      </div>

      <!-- Fin -->
    </form>
  </div>
</template>

<script>
export default {
  name: "CreatePost",
  data: () => {
    return {
      content: "", // Corps du post
      imageurl: "", // Gif du post
    };
  },
  methods: {
    sendPost() {
      // Envois du corps au parent pour traiter l'envois à l'API
      const formValid = document
        .getElementsByName("createPost")[0]
        .checkValidity();
      if (formValid) {
        this.$emit("post-sent", this.$data);
        document.getElementsByName("content")[0].value = null;
        document.getElementsByName("imageurl")[0].value = null;
      }
    },
    sendFile(event) {
      // Envois du Gif au parent pour traiter l'envois à l'API
      this.$data.imageurl = event.target.files[0];
    },
  },
};
</script>

<style scoped lang="scss">
label.file-button {
  width: 10em;
  height: 40px;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  overflow: hidden;
  position: relative;
  background-color: #007bff;
  color: #fff;
  margin-top: 8px;
  cursor: pointer;
  &:hover {
    background-color: #036ddf;
  }
}

label span input {
  z-index: 999;
  line-height: 0;
  font-size: 50px;
  position: absolute;
  top: -2px;
  left: -700px;
  opacity: 0;
  filter: alpha(opacity = 0);
  -ms-filter: "alpha(opacity=0)";
  margin: 0;
  padding: 0;
}

.pointer {
  cursor: pointer;
}

.image-selector {
  background-color: #fafafa;
}
.publish button {
  width: 10em;
  height: 40px;
}
</style>
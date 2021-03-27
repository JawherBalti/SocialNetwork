<template>
  <article class="mb-3" :id="idPost">
    <header class="row">
      <!-- Informations sur l'user -->
      <div>
        <span
          class="user-info pointer"
          role="link"
          @click="goToProfile(idUser)"
        >
          <span>
            <slot class="avatar" name="userAvatar"></slot>
          </span>
          <slot name="userName"></slot>
        </span>
      </div>

      <span class="delete-post">
        <slot name="postDelete"></slot>
      </span>
    </header>
    <p class="post-date">
      <small>
        <slot name="postDate"></slot>
      </small>
    </p>
    <!-- Fin -->
    <!-- Corps du post -->
    <div
      class="content"
      :class="cursor"
      role="link"
      @click="goToFeedID(idPost)"
    >
      <h5>
        <slot name="postContent"></slot>
      </h5>

      <!-- Gif du post -->
      <slot name="postGif"></slot>
      <!-- Fin -->

      <!-- Fin -->
    </div>

    <!-- Création d'un commentaire -->
    <div class="row">
      <div class="col-12">
        <slot name="createComment"></slot>
      </div>
    </div>
    <div class="row comments">
      <div class="col-12">
        <slot name="comments"></slot>
      </div>
    </div>
    <!-- Fin -->
    <!-- Reactions au post-->
    <footer class="row">
      <div class="col-4 col-md-2">
        <i
          class="fa fa-thumbs-up fa-lg pointer"
          aria-hidden="true"
          title="Aimer le post"
          role="button"
          :class="reactionUp"
          v-on:click="sendReactionUp"
        ></i>
        <span class="sr-only">Aimer le post</span>
        <span class="ml-1 reaction">
          <slot name="postUp"></slot>
        </span>
      </div>
      <div class="col-4 col-md-2">
        <i
          class="fa fa-thumbs-down fa-lg pointer"
          aria-hidden="true"
          title="Ne pas aimer le post"
          role="button"
          :class="reactionDown"
          v-on:click="sendReactionDown"
        ></i>
        <span class="sr-only">Ne pas aimer le post</span>
        <span class="ml-1 reaction">
          <slot name="postDown"></slot>
        </span>
      </div>
      <div class="col-4 col-md-4">
        <p class="comment">
          <i
            class="fa fa-pencil-square-o comment-icon"
            aria-hidden="true"
            title="Commmenter le post"
            role="button"
            v-on:click="displayCommentInput"
          ></i>
          <a class="pointer" v-on:click="displayCommentInput">Commenter</a>
        </p>
      </div>
      <div class="col-4 col-md-4">
        <p class="comment">
          <i
            class="fa fa-comments-o comment-icon"
            aria-hidden="true"
            title="Commmenter le post"
            role="button"
            v-on:click="displayComments"
          ></i>
          <a class="pointer" v-on:click="displayComments">Commentaires</a>
        </p>
      </div>
    </footer>
    <!-- Fin -->
  </article>
</template>

<script>
export default {
  name: "Post",
  props: ["idPost", "idUser", "reaction"],
  data: () => {
    return {
      reactionUp: "", // Nombre de réactions positives
      reactionDown: "", // Nombre de réactions négatives
      cursor: "pointer", // Défini le pointeur que doit avoir le corps et gif du post
    };
  },
  methods: {
    displayCommentInput() {
      // Envois de la requête pour dévoiler l'input pour créer un commentaire
      this.$emit("d-comment-input");
    },
    displayComments() {
      // Envois de la requête pour dévoiler les commentaire
      this.$emit("d-comments");
    },
    sendReactionUp() {
      // Envois de la réaction positive au parent pour traiter l'envoi à l'api
      if (this.reaction === 1) {
        this.$emit("reaction-none");
      }
      this.$emit("reaction-up");
    },
    sendReactionDown() {
      // Envois de la réaction négative au parent pour traiter l'envoi à l'api
      if (this.reaction === -1) {
        this.$emit("reaction-none");
      }
      this.$emit("reaction-down");
    },
    updateReaction() {
      // Update de la réaction au niveau visuelle avec CSS
      if (this.reaction === 1) {
        this.reactionUp = "reactionActive";
        this.reactionDown = "reactionNone";
      } else if (this.reaction === -1) {
        this.reactionUp = "reactionNone";
        this.reactionDown = "reactionActive";
      } else {
        this.reactionUp = "reactionNone";
        this.reactionDown = "reactionNone";
      }
    },
    goToFeedID(idPost) {
      // Route dynamique menant au post spécifique et ses commentaires
      if (idPost != undefined) {
        this.$router.push({ name: "FeedID", params: { id: idPost } });
      }
    },
    goToProfile(idUser) {
      // Route dynamique menant au profil de l'utilisateur ayant crée le commentaire
      this.$router.push({ name: "Profile", params: { id: idUser } });
    },
  },
  mounted() {
    // On update la réaction au niveau visuelle ainsi que le pointeur
    this.updateReaction();
    if (this.$route.name === "Feed") {
      this.cursor = "pointer";
    } else {
      this.cursor = "default";
    }
  },
  updated() {
    // On update la réaction au niveau visuelle
    this.updateReaction();
  },
};
</script>

<style scoped lang="scss">
article {
  background: linear-gradient(
    to right,
    rgb(200, 198, 196),
    rgb(255, 255, 255),
    rgb(200, 198, 196)
  );
  box-shadow: 1px 1px 5px;
  border-radius: 10px;
  overflow: hidden;
  margin: 2em auto;
  max-width: 550px;

  .comments {
    width: 90%;
    margin: auto;
  }

  header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    padding: 7px;
    background: linear-gradient(
      to right,
      rgb(200, 198, 196),
      rgb(255, 255, 255),
      rgb(200, 198, 196)
    );
    .user-info {
      font-weight: bold;
      margin: 1em;
      color: #2c3e50;
      &:hover {
        color: #4a6583;
      }
    }

    .delete-post {
      button {
        background-color: transparent;
        border-radius: 50%;
        margin-right: 1em;
        cursor: pointer;
        &:hover {
          color: #c60101;
        }
      }
      .fas {
        font-size: 1.2em;
        color: rgb(255, 0, 0);
      }
    }
  }
  .post-date {
    text-align: left;
    padding-left: 45px;
    font-style: italic;
    color: #2c3e50;
  }
  .content {
    font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
    margin: 1em 1em;
    padding: 1em 1em;
    background-color: rgb(255, 255, 255);
    border-radius: 10px;
  }
  .gif-img {
    max-width: 520px;
    max-height: 400px;
    box-shadow: 1px 1px 1px 1px;
    margin-bottom: 1em;
    @media (max-width: 768px) {
      border-radius: 0;
    }
  }
  i {
    &.reactionActive {
      color: #0132c6;
    }
    &.reactionNone {
      color: #2c3e50;
    }
    &:hover {
      color: #4a6583;
    }
  }
  .pointer {
    cursor: pointer;
  }

  footer {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    padding-top: 1em;
    background: linear-gradient(
      to right,
      rgb(200, 198, 196),
      rgb(255, 255, 255),
      rgb(200, 198, 196)
    );

    .reaction {
      font-style: italic;
      color: #2c3e50;
    }
  }
  .comment-icon {
    margin-right: 4px;
    color: #2c3e50;
    &:hover {
      color: #4a6583;
    }
  }
  .comment {
    color: #2c3e50;
    &:hover {
      color: #4a6583;
    }
  }
}

.app nav a.router-link-exact-active {
  color: #000000;
}
</style>

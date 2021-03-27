<template>
  <article class="mb-3">
    <div class="row no-gutters align-items-center">
      <div class="col-12 ">
        <div class="container">
          <!-- Informations sur l'utilisateur -->
          <header class="row">
            <div class="user-info">
              <span class="pointer" role="link" @click="goToProfile(idUser)">
                <span class="user-info pointer">
                  <slot class="avatar" name="commentUserAvatar"></slot>
                </span>
                <slot>{{ firstName + " " + lastName }}</slot>
              </span>
            </div>
            <div class="delete-post">
              <span>
                <slot name="commentDelete"></slot>
              </span>
            </div>
          </header>
          <p class="post-date">
            <small>
              <slot name="postDate"></slot>
            </small>
          </p>
          <!-- Fin -->
          <!-- Commentaire -->
          <div class="row text-center pt-3">
            <p class="col-12 h5-lg">
              <slot name="commentBody"></slot>
            </p>
          </div>
          <!-- Fin -->
        </div>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: "Comments",
  props: ["firstName", "lastName"],
  data: () => {
    return {
      reactionUp: "", // Nombre de réactions positives
      reactionDown: "", // Nombre de réactions négatives
    };
  },
  methods: {
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
    goToProfile(idUser) {
      // Route dynamique menant au profil de l'utilisateur ayant crée le commentaire
      this.$router.push({ name: "Profile", params: { id: idUser } });
    },
  },
  mounted() {
    // On update la réaction au niveau visuelle
    this.updateReaction();
  },
  updated() {
    // On update la réaction au niveau visuelle
    this.updateReaction();
  },
};
</script>

<style scoped lang="scss">
article {
  position: relative;
  i {
    &.reactionActive {
      color: rgb(233, 68, 38);
    }
    &.reactionNone {
      color: #2c3e50;
    }
    &:hover {
      color: rgb(233, 68, 38);
    }
  }
  .pointer {
    cursor: pointer;
  }

  header {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    .user-info {
      font-weight: bold;
      margin-left: 5px;
      color: #2c3e50;
      &:hover {
        color: #4a6583;
      }
    }
    .delete-post {
      button {
        background-color: transparent;
        margin-right: 10px;
        border-radius: 50%;
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
    padding-left: 30px;
    font-style: italic;
    color: #2c3e50;
  }
}
.text-muted {
  color: #000000 !important;
}
.app nav a.router-link-exact-active {
  color: #000000;
}
</style>

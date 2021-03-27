<template>
  <div>
    <!-- Importer les icones de suppression, like, dislike, commentaires -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    />
    <!-- Fin -->

    <!-- Alert si l'user est non connecté -->
    <Alert
      v-if="!connected"
      :alertType="alert.type"
      :alertMessage="alert.message"
    />
    <!-- Fin -->
    <div v-else>
      <!-- Navigation -->
      <NavFeed v-bind:id="data.userId" v-bind:isAdmin="data.isAdmin" />
      <!-- Fin -->
      <!-- Création des posts -->
      <CreatePost v-on:post-sent="post" />
      <!-- Fin -->
      <!-- Alert si l'utilisateur est non connecté -->
      <Alert
        v-if="alert.active && !alert.activeComment"
        :alertType="alert.type"
        :alertMessage="alert.message"
      />
      <!-- Fin -->

      <!-- Post -->
      <Post
        v-for="post in posts"
        :key="post.id"
        v-bind:reaction="post.likes.currentUserReaction"
        v-on:d-comment-input="commentInput(post.id)"
        v-on:d-comments="getComments(post.id)"
        v-on:reaction-down="dislikePost(post.id, data.userId, -1)"
        v-on:reaction-up="likePost(post.id, data.userId, 1)"
      >
        <!-- Bouton de suppréssion du post -->
        <template v-slot:postDelete v-if="isAdmin == 1">
          <button
            class="btn fa fa-trash"
            aria-hidden="true"
            title="Supprimer le post"
            role="button"
            v-on:click="deletePost(post.id)"
          ></button>
          <span class="sr-only">Supprimer le post</span>
        </template>
        <template v-slot:postDelete v-else-if="post.user_id == data.userId">
          <button
            aria-hidden="true"
            title="Supprimer le post"
            role="button"
            v-on:click="deletePost(post.id)"
            class="btn fa fa-trash"
          ></button>
          <span class="sr-only">Supprimer le post</span>
        </template>
        <!-- Fin -->

        <!-- Afficher les images dans les posts -->
        <template
          v-slot:postGif
          v-if="
            post.imageurl !== null &&
            (post.imageurl.includes('.gif') ||
              post.imageurl.includes('.jpg') ||
              post.imageurl.includes('.jpeg') ||
              post.imageurl.includes('.png'))"
        >
          <img
            :src="post.imageurl"
            class="card-img gif-img"
            alt="Image du post"
          />
        </template>
        <!-- Fin -->

        <!-- Afficher les vidéos (mp4) dans les posts -->
        <template
          v-slot:postGif
          v-else-if="post.imageurl !== null && post.imageurl.includes('.mp4')"
        >
          <video width="100%" controls>
            <source :src="post.imageurl" type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </template>
        <!-- Fin -->

        <!-- Informations de l'utilisateur -->
        <template v-slot:userAvatar>
          <img
            :src="data.pictureurl"
            class="card-img avatar rounded-circle mr-1"
            alt="Avatar de l'utilisateur"
          />
        </template>
        <template v-slot:userName>{{
          post.firstName + " " + post.lastName
        }}</template>
        <template v-slot:postDate>{{
          new Date(post.publication_date)
        }}</template>
        >
        <!-- Fin -->
        <!-- Corps du post -->
        <template v-slot:postContent>{{ post.content }}</template>
        <!-- Fin -->
        <!-- Création d'un commentaire -->
        <template v-slot:createComment>
          <CreateComment
            v-on:comment-sent="updateBody"
            v-if="commentInputShow && commentID === post.id"
          >
            <button
              class="btn btn-primary"
              type="submit"
              v-on:click.prevent="postComment(post.id)"
            >
              Publier
            </button>
          </CreateComment>
          <Alert
            v-if="alert.active && alert.activeComment && commentID === post.id"
            :alertType="alert.type"
            :alertMessage="alert.message"
          />
        </template>
        <template v-slot:comments v-if="commentShow && commentID === post.id">
          <Comments
            v-for="comment in comments"
            :key="comment.id"
            :firstName="comment.firstName"
            :lastName="comment.lastName"
          >
            <template v-slot:commentUserAvatar>
              <img
                :src="comment.pictureurl"
                class="card-img avatar rounded-circle mr-1"
                alt="image de l'utilisateur"
              />
            </template>

            <template v-slot:commentDelete v-if="comment.userId == data.userId">
              <button
                aria-hidden="true"
                title="Supprimer le post"
                role="button"
                v-on:click="deleteComment(comment.Commentid)"
                class="btn fa fa-trash"
              ></button>
              <span class="sr-only">Supprimer le post</span>
            </template>

            <template v-slot:postDate>
              <p>{{ new Date(comment.publication_date) }}</p>
            </template>
            <template v-slot:commentBody>
              <p class="content">{{ comment.content }}</p>
            </template>
          </Comments>
        </template>

        <!-- Fin -->
        <!-- Footer post -->
        <template v-slot:postUp>{{ post.likes.LikesNumber }}</template>
        <template v-slot:postDown>{{ post.likes.DislikesNumber }}</template>
        <!-- Fin -->
      </Post>
      <!-- Fin -->
    </div>
  </div>
</template>

<script>
import NavFeed from "@/components/NavFeed.vue";
import Post from "@/components/Post.vue";
import Alert from "@/components/Alert.vue";
import CreatePost from "@/components/CreatePost.vue";
import CreateComment from "@/components/CreateComment.vue";
import Comments from "@/components/Comments.vue";
import Toasted from "vue-toasted";
import Vue from "vue";
Vue.use(Toasted);

export default {
  name: "Feed",
  props: ["id"],
  components: {
    NavFeed,
    Post,
    Alert,
    CreatePost,
    CreateComment,
    Comments,
  },
  data: () => {
    return {
      connected: true, // Défini si l'user est connecté
      alert: {
        active: false, // Défini si l'alerte doit être montré
        activeComment: false, // Défini si l'alerte concerne un commentaire
        type: "",
        message: "",
      },
      posts: [], // Stock les posts
      content: "", // Stock le corps du commentaire
      commentInputShow: false, // Défini si l'input de la création de commentaire doit être montré
      commentShow: false,
      commentID: "", // Stock l'id du post pour lequel le commentaire sera envoyé
      isAdmin: "", // Stock le role de l'utilisateur
      data: {}, //Stock les données de l'utilisateur connecté
      comments: [], //Stock les commentaires
    };
  },
  methods: {
    alertConstant(type, message) {
      // Crée une alerte
      const dataAlert = this.$data.alert;
      this.connected = false;
      dataAlert.type = type;
      dataAlert.message = message;
    },
    getUserRole() {
      // Récupère les infos de l'utilisateur
      this.$axios
        .get("user/currentuser", { withCredentials: true })
        .then((data) => {
          this.data = data.data;
          this.isAdmin = data.data.isAdmin;
        })
        .catch((e) => {
          if (e.response.status === 401) {
            this.alertConstant(
              "alert-warning mt-5",
              "Veuillez vous connecter !"
            );
          }
          if (e.response.status === 500) {
            this.alertConstant("alert-danger mt-5", "Erreur serveur");
          }
        });
    },
    get() {
      // Récupère les posts
      this.$axios
        .get("post", { withCredentials: true })
        .then((data) => {
          this.posts = data.data.posts;
        })
        .catch((e) => {
          if (e.response.status === 500) {
            this.alertConstant("alert-warning mt-5", "Erreur serveur!");
          }
        });
    },
    post(data) {
      // si l'utilisateur publie une image ou un texte
      if (data.imageurl || data.content) {
        const formData = new FormData();
        formData.append("image", data.imageurl);
        formData.append("content", data.content);
        this.$axios
          .post("post", formData, { withCredentials: true })
          .then(() => {
            this.get();
            this.$toasted.success("Post publié", { duration: 2000 });
            data.imageurl = null;
            data.content = "";
          })
          .catch((e) => {
            if (e.response.status == 500) {
              this.$toasted.error("Erreur serveur !", { duration: 2000 });
            }
          });
      }
      // sinon
      else {
        this.$toasted.error(
          "Veuillez choisir un fichier ou écrire du texte pour le publier",
          { duration: 2500 }
        );
      }
    },
    deletePost(postID) {
      // Supprime un post si c'est le notre
      this.$axios
        .delete("post/" + postID, { withCredentials: true })
        .then(() => {
          this.$axios
            .delete("comment/allComments/" + postID, { withCredentials: true })
            .then(() => {
              const indexPost = this.$data.posts
                .map((post) => {
                  return post.id;
                })
                .indexOf(postID);
              this.$data.posts.splice(indexPost, 1);

              this.$toasted.info("Post supprimé !", { duration: 2000 });
            });
        })
        .catch((e) => {
          if (e.response.status == 500) {
            this.$toasted.error("Erreur serveur !", { duration: 2000 });
          }
        });
    },
    likePost(postID, userId, rate) {
      this.$axios
        .post(
          `post/like/${postID}`,
          { id: userId, rate: rate },
          { withCredentials: true }
        )
        .then(() => {
          this.get();
        })
        .catch((e) => {
          if (e.response.status == 500) {
            this.$toasted.error("Erreur serveur !", { duration: 2000 });
          }
        });
    },
    dislikePost(postID, userId, rate) {
      this.$axios
        .post(
          `post/dislike/${postID}`,
          { id: userId, rate: rate },
          { withCredentials: true }
        )
        .then(() => {
          this.get();
        })
        .catch((e) => {
          if (e.response.status == 500) {
            this.$toasted.error("Erreur serveur !", { duration: 2000 });
          }
        });
    },
    commentInput(postID) {
      // Dévoile l'input pour créer un commentaire
      if (this.commentInputShow) {
        this.commentID = postID;
      } else {
        this.commentInputShow = true;
        this.commentShow = false;
        this.commentID = postID;
      }
    },
    getComments(postID) {
      // Récupérer les commentaires d'un post
      this.$axios
        .get(`comment/${postID}`, { withCredentials: true })
        .then((data) => {
          this.comments = data.data.comments;
        })
        .catch((e) => {
          if (e.response.status == 500) {
            this.$toasted.error("Erreur serveur !", { duration: 2000 });
          }
        });
      if (this.commentShow) {
        this.commentID = postID;
      } else {
        this.commentShow = true;
        this.commentInputShow = false;
        this.commentID = postID;
      }
      console.log(postID);
    },
    updateBody(data) {
      // Stock le corps du commentaire
      this.content = data.content;
    },
    postComment(postID) {
      // Poste le commentaire
      const formValid = document
        .getElementsByName("formComment")[0]
        .checkValidity();
      if (formValid) {
        this.$axios
          .post(
            `comment/${postID}`,
            { content: this.content },
            { withCredentials: true }
          )
          .then(() => {
            this.commentInputShow = false;
            this.alert.activeComment = true;
            this.$toasted.success("Commentaire publié", { duration: 1500 });
          })
          .catch((e) => {
            if (e.response.status == 500) {
              this.$toasted.error("Erreur serveur !", { duration: 2000 });
            }
          });
      }
    },
    deleteComment(commentID) {
      this.$axios
        .delete("comment/" + commentID, { withCredentials: true })
        .then(() => {
          const indexComment = this.$data.comments
            .map((comment) => {
              return comment.Commentid;
            })
            .indexOf(commentID);
          this.$data.comments.splice(indexComment, 1);

          this.$toasted.info("Commentaire supprimé", { duration: 1500 });
        })
        .catch((e) => {
          if (e.response.status == 500) {
            this.$toasted.error("Erreur serveur !", { duration: 2000 });
          }
        });
    },
  },
  created() {
    //identifier l'utilisateur connecté
    this.getUserRole();
    //créer un cookie
    document.cookie =
      "snToken" +
      "=" +
      sessionStorage.getItem("token") +
      ";" +
      24 * 60 * 60 * 1000 +
      ";path=/";
  },
  mounted() {
    // Récupère les posts et défini le titre
    this.get();
    document.title = "Fil d'actualité | Groupomania";
  },
};
</script>

<style scoped lang="scss">
.avatar {
  width: 2em;
  height: 2em;
  border: 1px solid #000;
}
.content {
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  background-color: rgb(255, 255, 255);
  border-radius: 10px;
}
i {
  position: absolute;
  left: 1em;
  top: 1em;
  z-index: 1;
  &:hover {
    color: rgb(233, 68, 38);
  }
}
</style>

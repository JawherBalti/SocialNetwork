<template>
  <div>
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

      <!-- Profil de l'utilsateur -->
      <section class="mt-5">
        <img
          :src="user.pictureurl"
          class="card-img avatar rounded-circle mr-1"
          alt="Avatar de l'utilisateur"
        />
        <h2 class="mt-1">{{ fullName }}</h2>
      </section>
      <!-- Fin -->

      <!-- mettre à jour le profil -->
      <section
        class="border-bottom"
        v-if="this.$route.params.id === data.userId"
      >
        <h2
          class="text-danger h6"
          data-toggle="collapse"
          href="#collapseUpdateProfile"
          role="button"
          aria-expanded="false"
          aria-controls="collapseUpdateProfile"
        >
          Modifier votre profil
        </h2>

        <form>
          <div class="form-group">
            <label class="file-button">
              Choisir une photo
              <span>
                <input
                  name="image"
                  type="file"
                  class="btn btn-light"
                  accept="image/*"
                  v-on:change="updateAvatar($event)"
                />
              </span>
            </label>
          </div>
          <div class="form-group">
            <input
              class="form-control text-center mb-3"
              type="text"
              placeholder="Nouveau Prenom"
              v-model="data.firstName"
            />
          </div>
          <div class="form-group">
            <input
              name="prenom"
              class="form-control text-center mb-3"
              type="text"
              placeholder="Nouveau Nom"
              v-model="data.lastName"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-md text-center"
            v-on:click.prevent="updateProfile"
          >
            Confirmer
          </button>
        </form>
      </section>

      <section
        class="mt-5 border-top"
        v-if="this.$route.params.id === data.userId"
      >
        <h2
          class="text-danger h6"
          data-toggle="collapse"
          href="#collapseUpdateProfile"
          role="button"
          aria-expanded="false"
          aria-controls="collapseUpdateProfile"
        >
          Changer le mot de passe
        </h2>
        <form>
          <div class="form-group">
            <input
              class="form-control text-center"
              type="password"
              placeholder="Ancient mot de passe"
              id="password"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="8 caractères minimum. Doit contenir 1 majuscule, 1 minuscule et 1 chiffre"
            />
          </div>

          <div class="form-group">
            <input
              class="form-control text-center mb-3"
              type="password"
              placeholder="Nouveau mot de passe"
              id="newPassword"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="8 caractères minimum. Doit contenir 1 majuscule, 1 minuscule et 1 chiffre"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-md text-center"
            v-on:click.prevent="changePassword"
          >
            Confirmer
          </button>
        </form>
      </section>
      <!-- Fin -->

      <!-- Form pour supprimer son compte -->
      <section
        class="mt-5 border-top"
        v-if="this.$route.params.id === data.userId"
      >
        <h2
          class="text-danger h6"
          data-toggle="collapse"
          href="#collapseDeleteProfile"
          role="button"
        >
          Supprimer votre compte
        </h2>
        <form id="collapseDeleteProfile">
          <div class="form-group">
            <input
              class="form-control text-center"
              type="password"
              placeholder="Mot de passe"
              id="passwordDelete"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="8 caractères minimum. Doit contenir 1 majuscule, 1 minuscule et 1 chiffre"
              required
            />
          </div>
          <button
            type="submit"
            class="btn btn-danger btn-md text-center"
            v-on:click.prevent="deleteProfile"
          >
            Supprimer
          </button>
        </form>
      </section>
      <!-- Fin -->
    </div>
  </div>
</template>

<script>
import NavFeed from "@/components/NavFeed.vue";
import Alert from "@/components/Alert.vue";

export default {
  name: "Profile",
  components: {
    NavFeed,
    Alert,
  },
  data: () => {
    return {
      connected: true, // Défini si l'user est connecté
      alert: {
        type: "",
        message: "",
      },
      user: {}, // Stock le données du profil visité
      data: {}, // Stock les données de l'utilisateur connecté
    };
  },
  computed: {
    fullName() {
      // Retourne le nom complet
      return `${this.user.firstName} ${this.user.lastName}`;
    },
  },
  methods: {
    alertConstant(type, message) {
      // Crée une alerte
      const dataAlert = this.$data.alert;
      this.connected = false;
      dataAlert.type = type;
      dataAlert.message = message;
    },
    getUser() {
      // Récupère les infos du profil visité
      this.$axios
        .get(`user/findby/${this.$route.params.id}`, { withCredentials: true })
        .then((data) => {
          this.user = data.data;
        })
        .catch((e) => {
          if (e.response.status === 401) {
            this.$toasted.error("utilisateur n'existe pas", { duration: 2000 });
          }
          if (e.response.status === 500) {
            this.alertConstant("alert-warning mt-5", "Erreur serveur");
          }
        });
    },
    getUserRole() {
      // Récupère les infos de l'utilisateur
      this.$axios
        .get("user/currentuser", { withCredentials: true })
        .then((data) => {
          this.data = data.data;
        })
        .catch((e) => {
          if (e.response.status === 401) {
            this.alertConstant(
              "alert-warning mt-5",
              "Veuillez vous connecter !"
            );
          }
          if (e.response.status === 500) {
            this.alertConstant("alert-warning mt-5", "Erreur serveur");
          }
        });
    },
    updateAvatar(event) {
      // Changer la photo du profil
      const image = event.target.files[0];
      const formData = new FormData();
      formData.append("image", image);
      this.$axios
        .put(`user/updateUser/${this.$route.params.id}`, formData, {
          withCredentials: true,
        })
        .then(() => {
          this.getUser();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    updateProfile() {
      // Changer les autres infos
      const firstName = this.data.firstName;
      const lastName = this.data.lastName;
      let data;
      data = {
        firstName: firstName,
        lastName: lastName,
      };

      this.$axios
        .put(`user/updateUser/${this.$route.params.id}`, data, {
          withCredentials: true,
        })
        .then(() => {
          this.$router.push({ name: "Feed" });
          this.$toasted.success("Informations mises à jour !", {
            duration: 2000,
          });
        })
        .catch((e) => {
          if (e.response.status === 500) {
            this.$toasted.error("Erreur serveur !", {
              duration: 2000,
            });
          }
        });
    },

    changePassword() {
      const oldPassword = document.getElementById("password").value;
      const newPassword = document.getElementById("newPassword").value;
      const newPasswordValid = document
        .getElementById("newPassword")
        .checkValidity();
      const passwordValid = document.getElementById("password").checkValidity();
      let data = {
        oldPassword: oldPassword,
        newPassword: newPassword,
      };
      if (passwordValid && newPasswordValid) {
        this.$axios
          .put(`user/password/${this.$route.params.id}`, data, {
            withCredentials: true,
          })
          .then(() => {
            this.$router.push({ name: "Feed" });
            this.$toasted.success("Mot de passe mis à jour !", {
              duration: 2000,
            });
          })
          .catch((e) => {
            if (e.response.status === 401) {
              this.$toasted.error("Ancien mot de passe incorrect !", {
                duration: 2000,
              });
            }
            if (e.response.status === 422) {
              this.$toasted.error(
                "Nouveau mot de passe ne respecte pas le format requis!",
                {
                  duration: 2000,
                }
              );
            }
            if (e.response.status === 500) {
              this.$toasted.error("Erreur serveur !", {
                duration: 2000,
              });
            }
          });
      } else {
        this.$toasted.error("Mot de passe ne respecte pas le format requis !", {
          duration: 2000,
        });
      }
    },
    deleteProfile() {
      // Supprime l'utilisateur
      const password = document.getElementById("passwordDelete").value;
      const passwordValid = document
        .getElementById("passwordDelete")
        .checkValidity();

      this.$axios
        .delete(`user/delete/${this.$route.params.id}`, {
          data: { password: password },
        })
        .then(() => {
          if (passwordValid) {
            this.$router.push({ name: "Login" });
          }
        })
        .catch((e) => {
          if (!passwordValid) {
            if (e.response.status === 401) {
              this.$toasted.error("Mot de passe invalide !", {
                duration: 2000,
              });
            }
            if (e.response.status === 400) {
              this.$toasted.error("Suppression échouée !", {
                duration: 2000,
              });
            }
            if (e.response.status === 500) {
              this.$toasted.error("Erreur serveur !", {
                duration: 2000,
              });
            }
          }
        });
    },
  },
  mounted() {
    this.getUser();
    this.getUserRole();
    document.title = "Info utilisateur | Groupomania";
  },
  watch: {
    // Permet d'actualiser l'utilisateur si l'on clic sur "Mon profil" pendant qu'on est déja sur une page d'utilisateur
    "$route.params.id": function () {
      this.getUser();
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
  border: 1px solid transparent;
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

.avatar {
  width: 10em;
  height: 10em;
  object-fit: cover;
}

.text-muted {
  color: #000000 !important;
}
.app nav a.router-link-exact-active {
  color: #000000;
}
.input-group-text {
  color: #000000;
}
.custom-file-label::after {
  color: #000000;
}
</style>

<template>
  <div class="container-fluid">
    <!-- Navigation -->
    <NavLogin />
    <!-- Fin -->
    <!-- Form pour login -->
    <form onsubmit="return false">
      <InfoLogin
        validateText="Se connecter"
        v-on:data-sent="updateData"
        v-on:request-sent="login"
      >
      </InfoLogin>
    </form>
    <!-- Fin -->
  </div>
</template>

<script>
import NavLogin from "@/components/NavLogin.vue";
import InfoLogin from "@/components/InfoLogin.vue";
import Toasted from "vue-toasted";
import Vue from "vue";
Vue.use(Toasted);

export default {
  name: "Login",
  components: {
    NavLogin,
    InfoLogin,
  },
  data: () => {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    updateData(data) {
      // Stock les infos de connexion
      this.email = data.email;
      this.password = data.password;
    },
    login() {
      // Connecte l'utilisateur
      this.$axios
        .post("user/login", this.$data)
        .then((data) => {
          const cookie = data.data.cryptedCookie;
          sessionStorage.setItem("token", cookie);
          this.$axios.defaults.headers.common["Authorization"] =
            "Bearer " + cookie;
          this.$router.push("Feed");
          this.$toasted.success("Vous êtes connecté", { duration: 2000 });
        })
        .catch((e) => {
          if (e.response.status === 401) {
            this.$toasted.error("Email ou mot de passe incorrect !", {
              duration: 2000,
            });
          }
          if (e.response.status === 500) {
            this.$toasted.error("Erreur serveur !", {
              duration: 2000,
            });
          }
          sessionStorage.removeItem("token");
        });
    },
  },
  mounted() {
    // Supprime le token pour la déconnexion et défini le titre
    sessionStorage.removeItem("token");
    document.cookie = "snToken= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    delete this.$axios.defaults.headers.common["Authorization"];
    document.title = "Se connecter | Groupomania";
  },
};
</script>
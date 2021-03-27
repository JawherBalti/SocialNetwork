<template>
  <div class="container-fluid">
    <!-- Navigation -->
    <NavLogin />
    <!-- Fin -->
    <!-- Form pour créer un compte / se connecter -->
    <form onsubmit="return false">
      <InfoSignup v-on:data-sent="updateDataSignup" />
      <InfoLogin
        validateText="S'inscrire"
        v-on:data-sent="updateDataLogin"
        v-on:request-sent="signup"
      >
      </InfoLogin>
    </form>
    <!-- Fin -->
  </div>
</template>

<script>
import NavLogin from "@/components/NavLogin.vue";
import InfoLogin from "@/components/InfoLogin.vue";
import InfoSignup from "@/components/InfoSignup.vue";

export default {
  name: "Signup",
  components: {
    NavLogin,
    InfoLogin,
    InfoSignup,
  },
  data: () => {
    return {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    };
  },
  methods: {
    updateDataSignup(data) {
      // Stock le prénom et nom
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    },
    updateDataLogin(data) {
      // Stock l'email et le mot de passe
      this.email = data.email;
      this.password = data.password;
    },
    signup() {
      // Inscrit et connecte l'utilisateur
      this.$axios
        .post("user/register", this.$data)
        .then(() => {
          this.$axios
            .post("user/login", { email: this.email, password: this.password })
            .then((data) => {
              sessionStorage.setItem("token", data.data.cryptedCookie);
              this.$axios.defaults.headers.common["Authorization"] =
                "Bearer " + data.data.token;
              this.$router.push("Feed");
            });
        })
        .catch((e) => {
          console.log(e);
          if (e.response.status === 500) {
            this.$toasted.error("L'email est déjà utilisé !", {
              duration: 2000,
            });
          }
          if (e.response.status === 403) {
            this.$toasted.error("L'email est déjà utilisé !", {
              duration: 2000,
            });
          }
          sessionStorage.removeItem("token");
        });
    },
  },
  mounted() {
    // Défini le titre
    document.title = "Création de compte | Groupomania";
  },
};
</script>

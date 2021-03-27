<template>
  <div>
    <!-- Input pour l'email -->
    <div class="form-group">
      <input
        class="form-control text-center"
        type="email"
        placeholder="Votre email"
        id="email"
        required
        pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+.[a-zA-Z.]{2,15}"
        maxlength="60"
        aria-label="Entrez votre email"
        v-model="email"
        v-on:input="sendData"
      />
    </div>
    <!-- Fin -->

    <!-- Input pour le mot de passe -->
    <div class="form-group ">
      <input
        class="form-control text-center"
        type="password"
        placeholder="Votre mot de passe"
        id="password"
        required
        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
        title="8 caractères minimum. Doit contenir 1 majuscule, 1 minuscule et 1 chiffre"
        aria-label="Entrez votre mot de passe"
        aria-describedby="passwordInfo"
        v-model="password"
        v-on:input="sendData"
      />
    </div>
    <!-- Fin -->

    <!-- Bouton de connexion -->
    <button
      class="btn btn-primary btn-md text-center"
      type="submit"
      v-on:click="sendRequest"
    >
      {{ validateText }}
    </button>
  <!-- Fin -->
  </div>
</template>

<script>
export default {
  name: "InfoLogin",
  props: ["validateText"],
  data: () => {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    sendData() {
      // Envois des données au parent
      this.$emit("data-sent", this.$data);
    },
    sendRequest() {
      // Envois de la requête d'envois au parent pour traiter l'envois à l'API
      const emailValid = document.getElementById("email").checkValidity();
      const passwordValid = document.getElementById("password").checkValidity();
      if (emailValid && passwordValid) {
        this.$emit("request-sent");
      }
    },
  },
};
</script>
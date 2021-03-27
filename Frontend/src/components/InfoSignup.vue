<template>
  <div>
    <!-- Input pour le prénom -->
    <div class="form-group">
      <input
        class="form-control text-center"
        type="text"
        placeholder="Votre prénom"
        id="firstName"
        required
        maxlength="30"
        aria-label="Entrez votre prénom"
        v-model="firstName"
        v-on:input="sendData"
      />
    </div>
    <!-- Fin -->
    <!-- Input pour le nom -->
    <div class="form-group">
      <input
        class="form-control text-center"
        type="text"
        placeholder="Votre nom"
        id="lastName"
        required
        maxlength="30"
        aria-label="Entrez votre nom"
        v-model="lastName"
        v-on:input="sendData"
      />
    </div>
    <!-- Fin -->
  </div>
</template>

<script>
export default {
  name: "InfoSignup",
  data: () => {
    return {
      firstName: "",
      lastName: "",
    };
  },
  methods: {
    sendData() {
      // Envois des données au parent pour traiter l'envois à l'API
      const firstNameValid = document
        .getElementById("firstName")
        .checkValidity();
      const lastNameValid = document.getElementById("lastName").checkValidity();
      if (firstNameValid && lastNameValid) {
        this.$emit("data-sent", this.$data);
      }
    },
  },
};
</script>
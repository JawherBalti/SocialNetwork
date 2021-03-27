<template>
  <div>
    <div>
      <!-- Navigation -->
      <NavFeed v-bind:id="data.userId" v-bind:isAdmin="data.isAdmin" />
      <!-- Fin -->

      <!-- Alert si l'user est non connecté -->
      <Alert
        v-if="alert.active && !alert.activeComment"
        :alertType="alert.type"
        :alertMessage="alert.message"
      />
      <!-- Fin -->

      <table class="table table-hover">
        <thead>
          <input
            v-model.trim="inputValue"
            @input="searchUser()"
            type="text"
            class="admin-search"
            placeholder="Chercher un utilisateur"
          />
          <tr>
            <th class="table-head">Prénom</th>
            <th class="table-head">Nom</th>
            <th class="table-head">Photo de profil</th>
            <th class="table-head">Role</th>
            <th class="table-head">Supprimer</th>
          </tr>
        </thead>
        <tbody
          class="table-content"
          v-for="user in searchedUsers"
          :key="user.id"
        >
          <tr>
            <td>{{ user.firstName }}</td>
            <td>{{ user.lastName }}</td>
            <td>
              <a :href="user.pictureurl">
                <img
                  :src="user.pictureurl"
                  class="card-img avatar rounded-circle mr-1"
                  alt="Avatar de l'utilisateur"
                />
              </a>
            </td>
            <td class="selector">
              <select
                v-if="user.isAdmin == 0"
                v-on:click="(e) => setRole(e.target.value)"
                class="role"
                name="role"
                id="role"
              >
                <option value="0">User</option>
                <option value="1">Admin</option>
              </select>

              <select
                v-else
                v-on:click="(e) => setRole(e.target.value)"
                class="role"
                name="role"
                id="role"
              >
                <option value="1">Admin</option>
                <option value="0">User</option>
              </select>
              <button
                v-if="user.isAdmin == role || role == ''"
                disabled
                class="btn btn-primary"
              >
                Editer
              </button>
              <button
                v-else
                v-on:click="changeRole(user.id, role)"
                class="btn btn-primary"
              >
                Editer
              </button>
            </td>
            <td>
              <button v-on:click="deleteUser(user.id)" class="btn btn-danger">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
      messageError: null,
      alert: {
        active: false, // Défini si l'alerte doit être montré
        activeComment: false, // Défini si l'alerte concerne un commentaire
        type: "",
        message: "",
      },
      user: {}, // Stock les infos de l'utilisateur
      data: {},
      users: [], //Stock tous les utilisateurs
      searchedUsers: [], //Stock l'utilisateur cherché
      role: "", //Stock le role de l'utilisateur
      inputValue: "", 
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
    setRole(role) {
      this.role = role;
    },
    changeRole(id, role) {
      this.$axios
        .put(`user/admin/${id}`, { isAdmin: role }, { withCredentials: true })
        .then(() => {
          this.role = "";
          this.$toasted.success("Role changé", { duration: 1500 });
          this.getUsers();
        })
        .catch((e) => {
          if (e.response.status === 400) {
            this.$toasted.error("Il faut avoir au moins un admin !", {
              duration: 2500,
            });
          }
          if (e.response.status === 403) {
            this.$toasted.error("Vous devez être admin !", {
              duration: 2500,
            });
          }
        });
    },
    getUserRole() {
      // Récupère les infos de l'utilisateur connecté
      this.$axios
        .get("user/currentuser", { withCredentials: true })
        .then((data) => {
          this.data = data.data;
          this.isAdmin = data.data.isAdmin;
        })
        .catch((e) => {
          if (e.response.status === 401) {
            this.alertConstant("alert-warning mt-5", "Utilisateur non trouvé");
          }
          if (e.response.status === 500) {
            this.alertConstant("alert-warning mt-5", "Erreur serveur");
          }
        });
    },
    getUsers() {
      // Récupère tous les utilisateurs
      this.$axios
        .get(`user`, { withCredentials: true })
        .then((data) => {
          this.users = data.data.users;
          this.searchedUsers = data.data.users;
        })
        .catch((e) => {
          if (e.response.status === 500) {
            this.alertConstant("alert-warning mt-5", "Erreur serveur");
          }
        });
    },
    searchUser() {
      this.searchedUsers = this.users.filter((user) => {
        const userInfo = user.firstName + " " + user.lastName;
        return userInfo.includes(this.inputValue);
      });
    },
    deleteUser(id) {
      // Supprime l'utilisateur
      this.$axios
        .delete(`user/admin/delete/${id}`, { withCredentials: true })
        .then(() => {
          this.$toasted.info("Utilisateur supprimé", { duration: 1500 });
          this.getUsers();
        })
        .catch((e) => {
          if (e.response.status === 400) {
            this.$toasted.error("Il faut avoir au moins un admin", {
              duration: 2500,
            });
          }
        });
    },
  },
  mounted() {
    this.getUsers();
    this.getUserRole();
    document.title = "Administrateur | Groupomania";
  },
  watch: {
    "$route.params.id": function () {
      this.getUsers();
    },
  },
};
</script>

<style scoped lang="scss">
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
  width: 2em;
  height: 2em;
  border: 1px solid #000;
}

.table-content {
  font-weight: bold;
  font-style: italic;
  color: #2c3e50;
}

.role {
  background: transparent;
  border: 1px solid #fff;
  width: 10em;
  border-radius: 0.25rem;
  color: #2c3e50;
  font-weight: bold;
  font-style: italic;
  margin-right: 1em;
}
.table-head {
  text-align: center;
}

.selector select {
  align-items: center;
  height: 2.25em;
}

input[type="text"] {
  background: transparent;
}
.admin-search {
  padding: 5px 16px;
  margin-bottom: 10px;
  border: 1px solid #000;
  outline: none;
  border-radius: 20px;
  text-align: center;
  @media (max-width: 991px) {
    width: 13em;
  }
}
::placeholder {
  color: rgb(0, 0, 0);
  opacity: 1; /* Firefox */
}

:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: rgb(0, 0, 0);
}

::-ms-input-placeholder {
  /* Microsoft Edge */
  color: rgb(0, 0, 0);
}
</style>

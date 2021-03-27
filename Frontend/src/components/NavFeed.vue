<template>
  <header class="mb-1 mb-md-3">
    <nav class="navbar navbar-expand-lg navbar-light">
      <!-- Logo Groupomania -->
      <div class="navbar-brand logo-center">
        <router-link to="/Feed">
          <img
            class="img-fluid"
            alt="Groupomania"
            src="../assets/icon-left-font-monochrome-black.svg"
            role="link"
          />
        </router-link>
      </div>
      <!-- Fin -->

      <div class="dropdown">
        <input
          v-if="Object.keys(selectedItem).length === 0"
          ref="dropdowninput"
          v-model.trim="inputValue"
          class="dropdown-input search-bar-center"
          type="text"
          placeholder="Chercher un profil"
        />
        <div v-else @click="resetSelection" class="dropdown-selected"></div>
        <div v-show="inputValue && apiLoaded" class="dropdown-list">
          <router-link
            v-for="user in userList"
            :key="user.id"
            :to="{ name: 'Profile', params: { id: user.id } }"
          >
            <div
              @click="selectItem(user)"
              v-show="itemVisible(user)"
              class="dropdown-item"
            >
              <img :src="user.pictureurl" class="dropdown-item-avatar" />
              {{ user.firstName + " " + user.lastName }}
            </div>
          </router-link>
        </div>
      </div>

      <!-- Menu de navigation -->
      <div
        class="navbar-collapse align-self-end justify-content-end"
        id="navbarNavAltMarkup"
      >
        <div class="navbar-nav ">
          <p class="mr-lg-4 text-right nav-link-center">
            <router-link :to="{ name: 'Profile', params: { id: id } }"
              >Mon profil</router-link
            >
          </p>
          <p class="mr-lg-4 text-right nav-link-center" v-if="isAdmin == 1">
            <router-link to="/Users">Utilisateurs</router-link>
          </p>
          <p class="text-right nav-link-center">
            <router-link to="/">Se déconnecter</router-link>
          </p>
        </div>
      </div>
      <!-- Fin -->
    </nav>
  </header>
</template>

<script>
import axios from "axios";

export default {
  name: "NavFeed",
  props: ["id", "isAdmin"],

  data() {
    return {
      selectedItem: {},
      inputValue: "",
      userList: [],
      apiLoaded: false,
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    resetSelection() {
      this.selectedItem = {};
      this.$nextTick(() => this.$refs.dropdowninput.focus());
      this.$emit("on-item-reset");
    },
    selectItem(theItem) {
      this.selectedItem = theItem;
      this.inputValue = "";
      this.$emit("on-item-selected", theItem);
    },
    itemVisible(item) {
      let currentFirstName = item.firstName.toLowerCase();
      let currentLastName = item.lastName.toLowerCase();
      let currentUser = currentFirstName + " " + currentLastName;
      let currentInput = this.inputValue.toLowerCase();
      return currentUser.includes(currentInput);
    },
    getList() {
      axios.get(`user`, { withCredentials: true }).then((response) => {
        this.userList = response.data.users;
        this.apiLoaded = true;
      });
    },
  },
};
</script>

<style scoped lang="scss">
input[type="text"] {
  background: transparent;
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
.dropdown {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
.dropdown-input,
.dropdown-selected {
  width: 60%;
  padding: 5px 16px;
  line-height: 1.5em;
  border: 1px solid #000;
  outline: none;
  border-radius: 20px;
  text-align: center;
}
.dropdown-input:focus,
.dropdown-selected:hover {
  border-color: #e2e8f0;
}
.dropdown-input::placeholder {
  opacity: 0.7;
}
.dropdown-selected {
  font-weight: bold;
  cursor: pointer;
}
.dropdown-list {
  position: absolute;
  width: 100%;
  max-height: 500px;
  margin-top: 4px;
  overflow-y: auto;
  background: #eeeeee;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 20px;
}
.dropdown-item {
  display: flex;
  width: 100%;
  padding: 11px 16px;
  cursor: pointer;
}
.dropdown-item:hover {
  background: #edf2f7;
}
.dropdown-item-avatar {
  max-width: 24px;
  max-height: 18px;
  margin: auto 12px auto 0px;
}
.logo-center {
  @media (max-width: 991px) {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
  }
}

.search-bar-center {
  @media (max-width: 991px) {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
}

.nav-link-center {
  @media (max-width: 991px) {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
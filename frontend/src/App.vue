<script setup>
import { RouterLink, RouterView } from "vue-router"
import { ref, onMounted } from "vue"
import { useToast } from "vue-toastification"
import { useUserStore } from "./stores/user"
import { useRouter } from "vue-router"

import { useDark, useToggle } from "@vueuse/core"

const isDark = useDark({
    selector: "body",
    attribute: "theme",
    valueDark: "custom-dark",
    valueLight: "custom-light",
})
const toggleDark = useToggle(isDark)

const userStore = useUserStore()
const toast = useToast()
const router = useRouter()
const restoredUser = ref(false)

//color: #17f672 Verde Logo
//color: #0bbad6 Azul Logo

const logout = async () => {
    if (await userStore.logout()) {
        toast.success("User has logged out of the application.")
        router.push({ name: "Login" })
    } else {
        toast.error("There was a problem logging out of the application!")
    }
}

const formatUserName = (fullName) => {
    const names = fullName.split(" ")
    if (names.length >= 2) {
        return `${names[0]} ${names[names.length - 1]}`
    } else {
        return fullName
    }
}

onMounted(async () => {
    restoredUser.value = await userStore.restoreToken()
})
</script>

<template>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark sticky-top flex-md-nowrap p-0 shadow">
        <div class="container-fluid">
            <router-link
                v-if="userStore.user?.user_type == 'A'"
                class="col-md-3 col-lg-2 me-0 d-flex align-items-center justify-content-center"
                :to="{ name: 'Dashboard' }"
            >
                <img
                    src="@/assets/vcard.png"
                    alt=""
                    class="d-inline-block align-text-top"
                    style="max-height: 30px; max-width: 100px"
                />
            </router-link>
            <router-link
                v-else
                class="col-md-3 col-lg-2 me-0 d-flex align-items-center justify-content-center"
                :to="{ name: 'Home' }"
            >
                <img
                    src="@/assets/vcard.png"
                    alt=""
                    class="d-inline-block align-text-top"
                    style="max-height: 30px; max-width: 100px"
                />
            </router-link>
            <button
                id="buttonSidebarExpandId"
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#sidebarMenu"
                aria-controls="sidebarMenu"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse justify-content-end">
                <ul class="navbar-nav">
                    <li class="nav-item" v-show="!userStore.user">
                        <router-link
                            class="nav-link"
                            :class="{ active: $route.name === 'NewVCard' }"
                            :to="{ name: 'NewVCard' }"
                            ><i class="bi bi-person-check-fill"></i>
                            Register
                        </router-link>
                    </li>
                    <li class="nav-item" v-show="!userStore.user">
                        <router-link
                            class="nav-link"
                            :class="{ active: $route.name === 'Login' }"
                            :to="{ name: 'Login' }"
                        >
                            <i class="bi bi-box-arrow-in-right"></i>
                            Login
                        </router-link>
                    </li>
                    <li class=" nav-item mt-2">
                        <i class="bi" :class="{ 'bi-sun': !isDark, 'bi-moon': isDark }"></i>
                        <button class="sm dark-button" @click="toggleDark()">
                            {{ isDark ? "Light Mode" : "Dark Mode" }}
                        </button>
                    </li>
                    <li class="nav-item dropdown">
                        <a
                            class="nav-link dropdown-toggle"
                            href="#"
                            id="navbarDropdownMenuLink"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <img
                                :src="userStore.userPhotoUrl"
                                class="rounded-circle z-depth-0 avatar-img"
                                alt="avatar image"
                            />
                            <span class="avatar-text">{{
                                formatUserName(userStore.userName)
                            }}</span>
                        </a>
                        <ul
                            class="dropdown-menu dropdown-menu-dark dropdown-menu-end"
                            aria-labelledby="navbarDropdownMenuLink"
                            v-show="userStore.user"
                        >
                            <li>
                                <div v-if="userStore.user?.user_type == 'A'">
                                    <router-link
                                        class="dropdown-item"
                                        :class="{
                                            active:
                                                $route.name == 'User' &&
                                                $route.params.id == userStore.userId,
                                        }"
                                        :to="{ name: 'User', params: { id: userStore.userId } }"
                                    >
                                        <i class="bi bi-person-square"></i>
                                        Profile
                                    </router-link>
                                </div>
                                <div v-if="userStore.user?.user_type == 'V'">
                                    <router-link
                                        class="dropdown-item"
                                        :class="{
                                            active:
                                                $route.name == 'ProfileVCard' &&
                                                $route.params.phone_number ==
                                                    userStore.userPhoneNumber,
                                        }"
                                        :to="{
                                            name: 'ProfileVCard',
                                            params: { phone_number: userStore.userPhoneNumber },
                                        }"
                                    >
                                        <i class="bi bi-person-square"></i>
                                        Profile
                                    </router-link>
                                </div>
                            </li>
                            <li>
                                <router-link
                                    class="dropdown-item"
                                    :class="{ active: $route.name === 'ChangePassword' }"
                                    :to="{ name: 'ChangePassword' }"
                                >
                                    <i class="bi bi-key-fill"></i>
                                    Change password
                                </router-link>
                            </li>
                            <li>
                                <hr class="dropdown-divider" />
                            </li>
                            <li>
                                <a class="dropdown-item" @click="logout" href="#"
                                    ><i class="bi bi-arrow-right"></i>Logout</a
                                >
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container-fluid">
        <div class="row">
            <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
                <div class="position-sticky pt-3" v-show="userStore.user">
                    <ul class="nav flex-column">
                        <li class="nav-item" v-show="userStore.user?.user_type == 'A'">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'Dashboard' }"
                                :to="{
                                    name: 'Dashboard',
                                }"
                            >
                                <i class="bi bi-house"></i>
                                Dashboard
                            </router-link>
                        </li>
                        <li class="nav-item" v-show="userStore.user?.user_type == 'A'">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'NewCreditTransaction' }"
                                :to="{
                                    name: 'NewCreditTransaction',
                                }"
                            >
                                <i class="bi bi-send-plus-fill"></i>
                                Add Credit
                            </router-link>
                        </li>
                        <li class="nav-item" v-show="userStore.user?.user_type == 'A'">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'Users' }"
                                :to="{
                                    name: 'Users',
                                }"
                            >
                                <i class="bi bi-people-fill"></i>
                                Admins
                            </router-link>
                        </li>
                        <li class="nav-item" v-show="userStore.user?.user_type == 'A'">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'VCards' }"
                                :to="{ name: 'VCards' }"
                            >
                                <i class="bi bi-list-check"></i>
                                VCards
                            </router-link>
                        </li>
                        <li class="nav-item" v-show="userStore.user?.user_type == 'A'">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'DefaultCategories' }"
                                :to="{
                                    name: 'DefaultCategories',
                                }"
                            >
                                <i class="bi bi-tags-fill"></i>
                                Default Categories
                            </router-link>
                        </li>

                        <li class="nav-item" v-show="userStore.user?.user_type == 'V'">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'NewTransaction' }"
                                :to="{
                                    name: 'NewTransaction',
                                }"
                            >
                                <i class="bi bi-cash"></i>
                                Send Money
                            </router-link>
                        </li>

                        <li class="nav-item" v-show="userStore.user?.user_type == 'V'">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'NewRequest' }"
                                :to="{
                                    name: 'NewRequest',
                                }"
                            >
                                <i class="bi bi-people"></i>
                                Request Money
                            </router-link>
                        </li>
                    </ul>

                    <h6
                        class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted"
                    >
                        <span style="color: #17f672" v-show="userStore.user?.user_type == 'V'"
                            >My VCard</span
                        >
                        <a
                            class="link-secondary"
                            href="#"
                            aria-label="Add a new project"
                            v-show="userStore.user?.user_type == 'V'"
                        >
                        </a>
                    </h6>
                    <ul class="nav flex-column mb-2" v-show="userStore.user?.user_type == 'V'">
                        <li class="nav-item">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'VCard' }"
                                :to="{
                                    name: 'VCard',
                                    params: { phone_number: userStore.userPhoneNumber },
                                }"
                            >
                                <i class="bi bi-credit-card"></i>
                                Details
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'Transactions' }"
                                :to="{
                                    name: 'Transactions',
                                }"
                            >
                                <i class="bi bi-bank"></i>
                                Transactions
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'Requests' }"
                                :to="{
                                    name: 'Requests',
                                }"
                            >
                                <i class="bi bi-wallet"></i>
                                Money Requests
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'Categories' }"
                                :to="{
                                    name: 'Categories',
                                }"
                            >
                                <i class="bi bi-tags"></i>
                                Categories
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link
                                class="nav-link w-100 me-3"
                                :class="{ active: $route.name === 'WinPrizes' }"
                                :to="{
                                    name: 'WinPrizes',
                                }"
                            >
                                <i class="bi bi-joystick"></i>
                                Play!
                            </router-link>
                        </li>
                    </ul>

                    <div class="collapse navbar-collapse justify-content-end">
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <router-link
                                    class="nav-link"
                                    :class="{ active: $route.name === 'NewVCard' }"
                                    :to="{ name: 'NewVCard' }"
                                    ><i class="bi bi-person-check-fill"></i>
                                    Register
                                </router-link>
                            </li>

                            <li class="nav-item">
                                <router-link
                                    class="nav-link"
                                    :class="{ active: $route.name === 'Login' }"
                                    :to="{ name: 'Login' }"
                                >
                                    <i class="bi bi-box-arrow-in-right"></i>
                                    Login
                                </router-link>
                            </li>

                            <li class="nav-item dropdown">
                                <a
                                    class="nav-link dropdown-toggle"
                                    href="#"
                                    id="navbarDropdownMenuLink"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <img
                                        :src="userStore.userPhotoUrl"
                                        class="rounded-circle z-depth-0 avatar-img"
                                        alt="avatar image"
                                    />
                                    <span class="avatar-text">{{ userStore.userName }}</span>
                                </a>
                                <ul
                                    class="dropdown-menu dropdown-menu-dark dropdown-menu-end"
                                    aria-labelledby="navbarDropdownMenuLink"
                                >
                                    <li>
                                        <div v-if="userStore.user?.user_type == 'A'">
                                            <router-link
                                                class="dropdown-item"
                                                :class="{
                                                    active:
                                                        $route.name == 'User' &&
                                                        $route.params.id == userStore.userId,
                                                }"
                                                :to="{
                                                    name: 'User',
                                                    params: { id: userStore.userId },
                                                }"
                                            >
                                                <i class="bi bi-person-square"></i>
                                                Profile
                                            </router-link>
                                        </div>
                                        <div v-if="userStore.user?.user_type == 'V'">
                                            <router-link
                                                class="dropdown-item"
                                                :class="{
                                                    active:
                                                        $route.name == 'VCard' &&
                                                        $route.params.phone_number ==
                                                            userStore.userPhoneNumber,
                                                }"
                                                :to="{
                                                    name: 'VCard',
                                                    params: {
                                                        phone_number: userStore.userPhoneNumber,
                                                    },
                                                }"
                                            >
                                                <i class="bi bi-person-square"></i>
                                                Profile
                                            </router-link>
                                        </div>
                                    </li>
                                    <li>
                                        <router-link
                                            class="dropdown-item"
                                            :class="{ active: $route.name === 'ChangePassword' }"
                                            :to="{ name: 'ChangePassword' }"
                                        >
                                            <i class="bi bi-key-fill"></i>
                                            Change password
                                        </router-link>
                                    </li>
                                    <li>
                                        <hr class="dropdown-divider" />
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#"
                                            ><i class="bi bi-arrow-right"></i>Logout</a
                                        >
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <router-view />
            </main>
        </div>
    </div>
</template>

<style>
@import "./assets/dashboard.css";

.avatar-img {
    margin: -1.2rem 0.8rem -2rem 0.8rem;
    width: 3.3rem;
    height: 3.3rem;
}

.avatar-text {
    line-height: 2.2rem;
    margin: 1rem 0.5rem -2rem 0;
    padding-top: 1rem;
}

.dropdown-item {
    font-size: 0.875rem;
}

.btn:focus {
    outline: none;
    box-shadow: none;
}

#sidebarMenu {
    overflow-y: auto;
}

.collapse.navbar-collapse.justify-content-end a {
    color: #0bbad6;
}

#sidebarMenu.collapse i {
    color: #17f672;
}

#sidebarMenu.collapse li.nav-item a {
    color: #0bbad6;
}

.dark-button {
    background-color: #212529;
    color: #0bbad6;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
    transition:
        background-color 0.3s,
        color 0.3s;
}

.dark-button:hover {
    background-color: #0bbad6;
    color: #fff;
}

[theme="custom-dark"] {
    background: #16171d;
    color: #fff;
}
</style>

<script setup>
import axios from "axios"
import { useToast } from "vue-toastification"
import { useUserStore } from "../../stores/user.js"
import { ref, watch, inject } from "vue"
import UserDetail from "./UserDetail.vue"
import { useRouter, onBeforeRouteLeave } from "vue-router"

const router = useRouter()
const toast = useToast()
const socket = inject("socket")
const userStore = useUserStore()

const props = defineProps({
    id: {
        type: Number,
        default: null,
    },
})

const newUser = () => {
    return {
        id: null,
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    }
}

const user = ref(newUser())
const errors = ref(null)
let originalValueStr = ""

const inserting = (id) => !id || id < 0
const loadUser = async (id) => {
    originalValueStr = ""
    errors.value = null
    if (inserting(id)) {
        user.value = newUser()
    } else {
        try {
            const response = await axios.get("admins/" + id)
            user.value = response.data.data
            originalValueStr = JSON.stringify(user.value)
        } catch (error) {
            console.error("Error loading user:", error)
        }
    }
}

const save = async (userToSave) => {
    errors.value = null
    if (inserting(props.id)) {
        try {
            const response = await axios.post("admins", userToSave)
            user.value = response.data.data
            originalValueStr = JSON.stringify(user.value)
            toast.success("User #" + user.value.name + " was registered successfully.")
            socket.emit('insertedUser', user.value)
            router.back()
        } catch (error) {
            if (error.response.status == 422) {
                errors.value = error.response.data.errors
                toast.error("User was not registered due to validation errors!")
            } else {
                toast.error("User was not registered due to unknown server error!")
            }
        }
    } else {
        try {
            const response = await axios.put("admins/" + props.id, userToSave)
            user.value = response.data.data
            originalValueStr = JSON.stringify(user.value)
            toast.success("User #" + user.value.id + " was updated successfully.")
            if (user.value.id == userStore.userId) {
                await userStore.loadUser()
            }
            socket.emit('updatedUser', user.value)
            router.back()
        } catch (error) {
            if (error.response.status == 422) {
                errors.value = error.response.data.errors
                toast.error("User #" + props.id + " was not updated due to validation errors!")
            } else {
                toast.error("User #" + props.id + " was not updated due to unknown server error!")
            }
        }
    }
}

const cancel = () => {
    originalValueStr = JSON.stringify(user.value)
    router.back()
}

watch(
    () => props.id,
    (newValue) => {
        loadUser(newValue)
    },
    { immediate: true },
)
let nextCallBack = null
const leaveConfirmed = () => {
    if (nextCallBack) {
        nextCallBack()
    }
}

onBeforeRouteLeave((to, from, next) => {
    nextCallBack = null
    let newValueStr = JSON.stringify(user.value)
    if (originalValueStr != newValueStr) {
        nextCallBack = next
    } else {
        next()
    }
})
</script>

<template>
    <confirmation-dialog ref="confirmationLeaveDialog" confirmationBtn="Discard changes and leave"
        msg="Do you really want to leave? You have unsaved changes!" @confirmed="leaveConfirmed">
    </confirmation-dialog>

    <UserDetail :user="user" :errors="errors" :inserting="inserting(id)" @save="save" @cancel="cancel"></UserDetail>
</template>

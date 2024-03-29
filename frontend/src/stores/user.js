import axios from 'axios'
import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useToast } from 'vue-toastification'
export const useUserStore = defineStore('user', () => {
  const serverBaseUrl = inject('apiDomain')
  const socket = inject('socket')
  const user = ref(null)
  const toast = useToast()
  const userName = computed(() => user.value?.name ?? 'Anonymous')
  const userId = computed(() => user.value?.id ?? -1)
  const userType = computed(() => user.value?.user_type ?? 'Anonymous')
  const userPhoneNumber = computed(() => user.value?.username ?? 0)
  const userPhotoUrl = computed(() =>
    user.value?.photo_url ? serverBaseUrl + '/storage/fotos/' + user.value.photo_url : avatarNoneUrl
  )

  async function loadUser() {
    try {
      const response = await axios.get('users/me')
      user.value = response.data.data
    } catch (error) {
      clearUser()
      throw error
    }
  }

  function clearUser() {
    delete axios.defaults.headers.common.Authorization
    sessionStorage.removeItem('token')
    user.value = null
  }

  async function getNotificationsAndShowToast(vcard) {
    const toast = useToast();
  
    try {
      const response = await axios.get('vcard/' + vcard + '/notifications');
  
      if (response.data && response.data.length > 0) {
        for (const notification of response.data) {
          toast.info(notification.message, {
            autoClose: 8000,
          });
  
        }
      } 
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      toast.error('Error fetching notifications.');
    }
  }

  async function login(credentials) {
    try {
      const response = await axios.post('login', credentials)
      axios.defaults.headers.common.Authorization = 'Bearer ' + response.data.access_token

      sessionStorage.setItem('token', response.data.access_token)
      await loadUser()
      socket.emit('loggedIn', user.value)
      if(user.value.user_type === 'V'){
        getNotificationsAndShowToast(user.value.username)
      }
      return true
    } catch (error) {
      clearUser()
      toast.error('Login failed - ' + error.response.data.message ?? 'Unknown error')
      return false
    }
  }
  async function logout() {
    try {
      await axios.post('logout')
      socket.emit('loggedOut', user.value)
      clearUser()
      return true
    } catch (error) {
      return false
    }
  }
  
  async function changePassword(credentials) {
    if (userId.value < 0) {
      throw 'Anonymous users cannot change the password!'
    }

    if (userType.value == 'A') {
      try {
        await axios.patch(`admins/${user.value.id}/password`, credentials)
        return true
      } catch (error) {
        throw error
      }
    } else {
      try {
        await axios.patch(`vcards/${user.value.id}/password`, credentials)
        return true
      } catch (error) {
        throw error
      }
    }
  }

  async function restoreToken() {
    let storedToken = sessionStorage.getItem('token')
    if (storedToken) {
      axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken
      await loadUser()
      socket.emit('loggedIn', user.value)
      return true
    }
    clearUser()
    return false
  }


  socket.on('insertedUser', (insertedUser) => {
    toast.info(`User #${insertedUser.id} (${insertedUser.name}) has registered successfully!`)
  })

  socket.on('updatedUser', (updatedUser) => {
    if (user.value?.id == updatedUser.id) {
      user.value = updatedUser
      toast.info('Your user profile has been changed!')
    } else {
      toast.info(`User profile #${updatedUser.id} (${updatedUser.name}) has changed!`)
    }
  })

  socket.on('blockedNotification', ({ user }) => {
    toast.info(`Your vcard (${user}) has been blocked`);
    logout();
  });

  socket.on('changedStatusNotification', ({ user, status }) => {
    if (status == 1) {
      toast.info(`User #${user} has changed status to blocked successfully!`)
    }
    else {
      toast.info(`User #${user} has changed status to unblocked successfully!`)
    }
  });

  socket.on('deletedUser', (userID) => {
    toast.info(`User #${userID} profile has been deleted!`)
  })

  socket.on('moneySentNotification', ({ sender, amount }) => {
    toast.info(`You have received ${amount}€ from ${sender}!`)
  })

  socket.on('receiverNotLoggedIn', async ({ receiver, sender, amount }) => {
    try {
      await axios.post('notifications', {
        vcard: receiver,
        message: `${sender} has sent you ${amount}€ !`
      });
    } catch (error) {
      console.error("Error saving notification in the database:", error.message);
    }
  });

  socket.on('requestMoneyNotification', ({ receiver, amount }) => {
    toast.info(`${receiver} has requested ${amount}€ from you!`)
  })

  socket.on('requestNotLoggedIn', async ({ receiver, sender, amount }) => {
    try {
      await axios.post('notifications', {
        vcard: sender,
        message: `${receiver} has request ${amount}€ from you !`
      });
      console.log("Notification saved in the database.");
    } catch (error) {
      console.error("Error saving notification in the database:", error.message);
    }
  });

  socket.on('acceptMoneyNotification', ({ sender, amount }) => {
    toast.info(`${sender} has accepted your request for ${amount}€ !`)
  })

  socket.on('acceptNotLoggedIn', async ({ receiver, sender, amount }) => {
    try {
      await axios.post('notifications', {
        vcard: receiver,
        message: `${sender} has accepted your request for ${amount}€ !`
      });
      console.log("Notification saved in the database.");
    } catch (error) {
      console.error("Error saving notification in the database:", error.message);
    }
  });

  socket.on('rejectMoneyNotification', ({ sender, receiver, amount, whoRejected}) => {
    if(whoRejected == 'S'){
      toast.info(`${sender} has rejected your request for ${amount}€ !`)
    }else{
      toast.info(`${receiver} has rejected his request for ${amount}€ !`)
    }
  })

  socket.on('rejectNotLoggedIn', async ({ receiver, sender, amount, whoRejected }) => {

    if(whoRejected === 'S'){
      try {
        await axios.post('notifications', {
          vcard: receiver,
          message: `${sender} has rejected your request for ${amount}€ !`
        });
        console.log("Notification saved in the database.");
      } catch (error) {
        console.error("Error saving notification in the database:", error.message);
      }
    }else{
      try {
        await axios.post('notifications', {
          vcard: sender,
          message: `${receiver} has rejected his request for ${amount}€ !`
        });
        console.log("Notification saved in the database.");
      } catch (error) {
        console.error("Error saving notification in the database:", error.message);
      }
    }
  });

  return {
    user,
    userId,
    userName,
    userType,
    userPhotoUrl,
    userPhoneNumber,
    loadUser,
    clearUser,
    login,
    logout,
    restoreToken,
    changePassword
  }
})

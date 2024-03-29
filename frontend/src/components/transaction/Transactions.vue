<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import axios from 'axios'
import TransactionTable from './TransactionTable.vue'
import { useUserStore } from '../../stores/user'
import { useRouter } from 'vue-router'
import { Bootstrap5Pagination } from 'laravel-vue-pagination'
import { useCategoryStore } from '../../stores/category'

const userStore = useUserStore()
const transactions = ref([])
const router = useRouter()
const paginationData = ref({})
const categoryStore = useCategoryStore()
const categories = ref([])
const socket = inject('socket')

socket.on('moneySentNotification', () => {
  loadTransactions()
})

const loadTransactions = (page = 1) => {
  axios
    .get('vcard/' + userStore.userPhoneNumber + '/transactions', {
      params: {
        page: page,
        startDate: startDate.value,
        endDate: endDate.value,
        type: type.value,
        method: method.value,
        category: category.value,
        orderBy: orderBy.value
      }
    })
    .then((response) => {
      paginationData.value = response.data
      transactions.value = response.data.data
      filteredTransactions.value = transactions.value
    })
    .catch((error) => {
      console.log(error)
    })
}

const loadCategories = async () => {
  categories.value = await categoryStore.loadCategory()
  categories.value.sort((a, b) => {
    const typeComparison = a.type.localeCompare(b.type)
    return typeComparison === 0 ? a.name.localeCompare(b.name) : typeComparison
  })
}

const editTransaction = (transaction) => {
  router.push({ name: 'Transaction', params: { id: transaction.id } })
}

const startDate = ref(null)
const endDate = ref(null)
const type = ref('')
const method = ref('')
const category = ref('')
const orderBy = ref('desc')
const filteredTransactions = ref([])

const filteredCategories = computed(() => {
  return categories.value.filter((category) => {
    return type.value ? category.type === type.value : true
  })
})

const updateType = () => {
  const selectedCategory = categories.value.find((cat) => cat.id === category.value)
  if (selectedCategory) {
    type.value = selectedCategory.type
  } else {
    type.value = null
  }
}

const applyFilters = () => {
  loadTransactions()
}

const clearFilters = () => {
  startDate.value = null
  endDate.value = null
  type.value = ''
  method.value = ''
  category.value = ''
  orderBy.value = 'desc'
  loadTransactions()
}

onMounted(() => {
  loadTransactions()
  loadCategories()
})
</script>

<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-3">
        <div class="mb-3">
          <label for="startDate" class="form-label">Start Date:</label>
          <input type="date" class="form-control" v-model="startDate" />
        </div>
      </div>

      <div class="col-md-3">
        <div class="mb-3">
          <label for="endDate" class="form-label">End Date:</label>
          <input type="date" class="form-control" v-model="endDate" />
        </div>
      </div>
      <div class="col-md-3">
        <div class="mb-3">
          <label for="type" class="form-label">Type:</label>
          <select class="form-select" v-model="type">
            <option value="">All</option>
            <option value="C">Credit</option>
            <option value="D">Debit</option>
          </select>
        </div>
      </div>
      <div class="col-md-3">
        <div class="mb-3">
          <label for="method" class="form-label">Method:</label>
          <select class="form-select" v-model="method">
            <option value="">All</option>
            <option value="VCARD">VCARD</option>
            <option value="MBWAY">MBWAY</option>
            <option value="IBAN">IBAN</option>
            <option value="MB">MB</option>
            <option value="VISA">VISA</option>
            <option value="PAYPAL">PAYPAL</option>
          </select>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <label for="category" class="form-label">Category:</label>
        <select v-model="category" class="form-select" @change="updateType">
          <option value="">All</option>
          <option v-for="category in filteredCategories" :key="category.id" :value="category.id">
            ({{ category.type }}) {{ category.name }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="orderBy" class="form-label">Order By:</label>
        <select v-model="orderBy" class="form-select">
          <option value="desc">Recent transactions</option>
          <option value="asc">Oldest transactions</option>
        </select>
      </div>
      <div class="col-md-3">
        <div class="mb-3">
          <button @click="applyFilters" class="btn btn-primary">Apply Filters</button>
        </div>
      </div>

      <div class="col-md-3">
        <div class="mb-3">
          <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
        </div>
      </div>
    </div>
  </div>

  <hr />
  <div v-if="filteredTransactions.length > 0">
    <TransactionTable :transactions="filteredTransactions" @edit="editTransaction">
    </TransactionTable>
    <Bootstrap5Pagination
      :data="paginationData"
      @pagination-change-page="loadTransactions"
      :limit="3"
    >
    </Bootstrap5Pagination>
  </div>
  <div v-else>No Transactions yet</div>
</template>

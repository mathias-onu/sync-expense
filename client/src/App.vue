<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";

interface Operation {
  operation: string
}

export default defineComponent({
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL + '/api' as string,
      oauthUrl: import.meta.env.VITE_OAUTH_URL as string,
      selectedOperation: null as Operation | null,
      operations: [
        { operation: 'withdrawal' },
        { operation: 'deposit' }
      ],
      fileValue: null as File | null,
      dateValue: null as string | null,
      amountValue: null as number | null,
      queryParams: new URLSearchParams(window.location.search),
      submitDisabled: false as boolean
    }
  },
  methods: {
    setOperation() {
      if (this.selectedOperation?.operation === 'deposit' && this.fileValue) this.fileValue = null
    },
    changeFile(e: any) {
      // [FIX] - Check if the file extension is .HEIC
      this.fileValue = e.target.files[0]
    },
    async submit(e: Event) {
      e.preventDefault()
      this.submitDisabled = true
      
      // Validate the amount input
      if (!this.amountValue) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in the amount.', life: 3000 })
        this.submitDisabled = false
        throw Error('The amount input does not have a value.')
      }

      const token = JSON.parse(localStorage.getItem('token')!)
      
      try {
        // Deposit operation logic
        if (this.selectedOperation!.operation === 'deposit') {
          const depositUpload = await axios(`${this.apiUrl}/convert?date=${this.dateValue}&operation=${this.selectedOperation?.operation}&amount=${Number(this.amountValue)}`, {
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`,
              }
          })

          if (!depositUpload) throw Error('An error has occurred')
          else {
            this.submitDisabled = false
            this.$toast.add({ severity: 'success', summary: 'Success', detail: 'The record has been successfully uploaded!', life: 3000 })
          }
        // Withdrawal operation logic
        } else {
          const formData = new FormData()
          formData.append('image', this.fileValue!)

          const fileUpload = await axios.post(`${this.apiUrl}/convert?date=${this.dateValue}&operation=${this.selectedOperation?.operation}&amount=${Number(this.amountValue)}`, formData, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": 'multipart/form-data'
            }
          })
          
          if (fileUpload.status > 300) throw Error('An error has occurred')
          else {
            this.submitDisabled = false
            this.$toast.add({ severity: 'success', summary: 'Success', detail: 'The record has been successfully uploaded!', life: 3000 })
          }
        }
        } catch (e) {
          this.submitDisabled = false
          localStorage.removeItem('token')
          this.$toast.add({ severity: 'error', summary: 'Error', detail: 'An error has occurred...', life: 3000 })
          setTimeout(() => {
            window.location.reload()
          }, 2000)
      }
    }
  },
  async beforeMount() {
    const oauthCode = this.queryParams.get('code')
    const token = JSON.parse(localStorage.getItem('token')!)

    // Handling the case where the auth needs to be redirected to google
    if (!token && !oauthCode) window.location.href = this.oauthUrl
    // Handling the case where there is an oauth query code
    else if (!token) {
        try {
          const tokenResponse = await axios.get(`${this.apiUrl}/auth/google?code=${oauthCode}`)

          if (tokenResponse.request.status === 400) throw Error(tokenResponse.request.error_description)
          else {
            localStorage.setItem('token', JSON.stringify(tokenResponse.data))
            window.location.replace(import.meta.env.PROD ? import.meta.env.VITE_OAUTH_URL : import.meta.env.VITE_DEV_SERVER_URL)
          }
        } catch (error) {
          this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Please try again...', life: 3000 })
        }
    }
  }
})
</script>

<template>
  <Toast />
  <!-- Future feature: create a logout btn for debugging purposes -->
  <div class="container">
    <form :onSubmit="submit">
      <div class="operation-select">
        <label for="operation">Operation:</label>
        <Dropdown 
          v-model="selectedOperation" 
          :options="operations" 
          optionLabel="operation" 
          placeholder="Select an operation" 
          id="operation" 
          @change="setOperation"
          required
        />
      </div>
      <div v-if="selectedOperation?.operation === 'withdrawal'" class="file-input">
        <label for="fileInput">
          <i class="pi pi-upload"></i>
          {{ fileValue?.name ? fileValue?.name : 'Upload a receipt' }}
        </label>
        <input type="file" id="fileInput" @change="changeFile" :required="selectedOperation?.operation === 'withdrawal'" />
      </div>
      <div class="date-input">
        <label for="date">Date:</label>
        <InputText v-model="dateValue" id="date" placeholder="YYYY-MM-DD" required />
      </div>
      <div class="amount-input">
        <label for="amount">Amount:</label>
        <InputNumber v-model="amountValue" mode="currency" currency="RON" locale="ro-RO" id="amount" placeholder="0,00 RON" required />
      </div>
      <Button label="Submit" type="submit" class="submit-btn" @click="submit" :loading="submitDisabled" icon="pi pi-cloud-upload" />
    </form>
  </div>
</template>

<style scoped>
  .container {
    margin-top: 5vh;
    height: 70vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: baseline;
  }

  form {
    width: 75%;
    display: flex;
    flex-direction: column
  }

  .operation-select, 
  .date-input,
  .amount-input,
  .file-input {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
  }

  #date, #operation, #amount {
    margin-top: 3px;
  }

  #fileInput {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .file-input label {
    border: none;
    cursor: pointer;
    margin-top: 8px;
    border: 1px solid var(--primary-color);
    border-radius: 7px;
    padding: 8px;
    width: 150px;
    color: var(--primary-color);
    font-size: 1rem;
  }

  .file-input i {
    margin-right: 5px;
  }

  .submit-btn {
    margin-top: 30px;
    width: auto;
  }
</style>

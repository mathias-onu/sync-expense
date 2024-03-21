<script lang="ts">
import { defineComponent } from "vue";

interface Operation {
  operation: string
}

export default defineComponent({
  data() {
    return {
      selectedOperation: null as Operation | null,
      operations: [
        { operation: 'withdrawal' },
        { operation: 'deposit' }
      ],
      fileValue: null as File | null,
      dateValue: null as string | null,
      amountValue: null as number | null
    }
  },
  methods: {
    setOperation() {
      if (this.selectedOperation?.operation === 'deposit' && this.fileValue) this.fileValue = null
    },
    changeFile(e: any) {
      this.fileValue = e.target.files[0]
    },
    submit(e: Event) {
      e.preventDefault()
      // For FORMS: https://vueform.com/docs/installation

      console.log('operation:', this.selectedOperation!.operation)
      if (this.fileValue) console.log('file:', this.fileValue)
      console.log('date:', this.dateValue)
      console.log('amount:', this.amountValue)

      // WIP: code from previous React app
      // Assign formdata only when the withdrawal operation is selected (also refactor the request)
      // const formData = new FormData()
      // const receipt = data.operation === 'withdrawal' ? data.receipt[0] : ''
      // formData.append('image', receipt)
      // setUploading(true)

      // try {
      //   const fileUpload = await fetch(`http://localhost:8080/api/convert?date=${data.date}&operation=${data.operation}&amount=${Number(data.amount)}`, {
      //     method: 'POST',
      //     body: formData,
      //     headers: {
      //       "Authorization": `Bearer ${token}`,
      //     }
      //   })
      //   console.log('before req', await fileUpload.json())
      //   if (!fileUpload.ok) throw Error('An error has occurred')
      //   else {
      //     setUploading(false)    
      //     toast.current?.show({ severity: 'success', summary: 'Success', detail: 'The record has been successfully uploaded!' })
      //   }
      // } catch (e) {
      //   console.log('error', e)
      //   setUploading(false)
      //   toast.current?.show({ severity: 'error', summary: 'Error', detail: 'An error has occurred' })
      // }
    }
  },
  mounted() {
    console.log(`On mount`)
    
    // WIP: code from previous React app
    // const oauthCode = queryParams.get('code')
    
    // /* The problem is with the authentication process
    //   When navigating on the page you should handle the following cases:
    //     - there is nor a token, nor a code in the query params
    //     - there is a code, but not a token 
    //     - there is a token, but it's expired
    // */
    // if (!token && !oauthCode) window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.appdata%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdocs%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly&response_type=code&client_id=621637399988-gfrm4vi1lc1mae7f1s743p9277f27d8t.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A5173'
    // else {
    //   const getToken = async () => {
    //     try {
    //       const tokenResponse = await fetch(`http://localhost:8080/api/auth/google?code=${oauthCode}`)
    //       const token = await tokenResponse.json()
    //       console.log('here', token)
    //       if (token.status === 400) throw Error(token.data.error_description)
    //       else {
    //         localStorage.setItem('token', JSON.stringify(token))
    //       }
    //     } catch (error) {
    //       console.log('error', error)
    //       toast.current?.show({ severity: 'error', summary: 'Error', detail: `${error}` })
    //     }
    //   }
    //   getToken()
    //   if (oauthCode) {
    //     queryParams.delete('code')
    //     setQueryParams(queryParams)
    //   }
    // }
  }
})
</script>

<template>
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
        <InputText id="date" v-model="dateValue" placeholder="YYYY-MM-DD" required />
      </div>
      <div class="amount-input">
        <label for="amount">Amount:</label>
        <InputNumber v-model="amountValue" mode="currency" currency="RON" locale="ro-RO" id="amount" placeholder="0,00 RON" required />
      </div>
      <Button label="Submit" type="submit" class="submit-btn" />
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

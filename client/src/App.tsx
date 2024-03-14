/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import './App.css'
import "primereact/resources/themes/lara-dark-blue/theme.css"
import 'primeicons/primeicons.css';
      
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { useForm } from "react-hook-form";

interface Operation {
  operation: string
}

function App() {
  const toast = useRef<Toast>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const operationOptions = [ 
    { operation: 'withdrawal' }, 
    { operation: 'deposit' }
  ]

  // https://github.com/satansdeer/react-hook-form-file-input/blob/master/src/App.js
  // https://www.react-hook-form.com/get-started/

  // Todo:
  // 1. Learn how to interact with forms
  // 2. Submit the convert
  // 3. Handle authentication on the client sides
  
  const handleFileChange = (e: any) => {
    const file = e.target.files[0]
    if (file) setFileName(file.name)
  }

  const onSubmit = async (data: any) => {
    console.log(data)

    // convert file to base64 encoded
    const formData = new FormData()
    const receipt = data.receipt[0]
    formData.append('image', receipt)
    setUploading(true)

    try {
      const fileUpload = await fetch(`http://localhost:8080/api/convert?date=${data.date}&operation=${data.operation}&amount=${Number(data.amount)}`, {
        method: 'POST',
        body: formData,
        headers: {
          "Authorization": "Bearer ya29.a0Ad52N3--f6R60cM87h5dybBCgVyKAnh5VRhiRMT5gzFyYxsRrXEuiRMOEwxOJhLA_ETzAq4kpIO9xbbzNs8_GZtYKeIIql3It6j7zrMzuPEcfND6s2Yxh8A6SKaGCPTfkTQaIWvujSLgREzvMzAkX_FMWqi7Amcm6UwaCgYKAbASARESFQHGX2MiIsrJExESiBg61GwsSG6FzA0170",
        }
      })
      
      if (!fileUpload.ok) throw Error('An error has occurred')
      else {
        setUploading(false)    
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'The record has been successfully uploaded!' })
      }
    } catch (e) {
      setUploading(false)
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'An error has occurred' })
    }
  }
    
  return (
    <>
      <Toast ref={toast} />
      <div className="container">
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="operation-input">
            <label htmlFor="withdraw">Withdraw</label>
            <Dropdown 
              {...register("operation", { required: true })}
              value={selectedOperation} 
              options={operationOptions} 
              onChange={(e: DropdownChangeEvent) => setSelectedOperation(e.value)}
              optionLabel="operation" 
              placeholder="Select an operation" 
              id="operations" 
            />
            {errors.operation && <span className='form-error'>This field is required</span>}
          </div>
          {selectedOperation?.operation === 'withdrawal' && 
            <div className="file-input">
              <label htmlFor="fileInput">
                <i className="pi pi-upload"></i>
                { fileName || 'Upload the receipt' }
              </label>
              <input type="file" {...register("receipt", { required: true })} onChange={handleFileChange} id="fileInput" />
              {errors.receipt && <span className='form-error'>This field is required</span>}
            </div>
          }
          <div className="date-input">
            <label htmlFor="date">Date</label>
            <InputText {...register("date", { required: true })} id="date" />
            {errors.date && <span className='form-error'>This field is required</span>}
          </div>
          <div className="amount-input">
            <label htmlFor="amount">Amount</label>
            <InputText id="amount" {...register("amount", { required: true })} />
            {errors.amount && <span className='form-error'>This field is required</span>}
          </div>
          <Button className='upload-btn' type='submit' disabled={uploading}>
            { uploading && <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>}
            Upload
          </Button>
        </form>
      </div>
    </>
  )
}

export default App

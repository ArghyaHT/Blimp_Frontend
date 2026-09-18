import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/api'
import styles from './BankAccount.module.css'
import toast from 'react-hot-toast'
import { toastStyle } from '../../../utils/toastStyles'

const BankAccount = () => {
  const { user, userId } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    address: '',
  })

  useEffect(() => {
    if (!userId) return

    const fetchBankInfo = async () => {
      setLoading(true)
      try {
        const { data } = await api.post('/bank-info', { user_id: userId })
        const account = data?.data || user || {}
        setFormData({
          bankName: account.bank_name || account.bankName || localStorage.getItem('bankName') || '',
          accountHolderName:
            account.account_holder_name ||
            account.bank_account_name ||
            account.accountHolderName ||
            localStorage.getItem('accountHolderName') ||
            '',
          accountNumber:
            account.account_number ||
            account.bank_account_number ||
            account.accountNumber ||
            localStorage.getItem('accountNumber') ||
            '',
          ifsc:
            account.bank_ifsc || account.ifsc_code || account.ifsc || localStorage.getItem('bankIfsc') || '',
          address: account.bank_address || account.bankAddress || localStorage.getItem('bankAddress') || '',
        })
      } catch (error) {
        console.error('Error fetching bank info', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBankInfo()
  }, [userId, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!userId) {
      toast.error('User not logged in', { style: toastStyle })
      return
    }

    setSaving(true)
    try {
      const payload = {
        user_id: userId,
        bankName: formData.bankName,
        account_holder_name: formData.accountHolderName,
        bankAccountNumber: formData.accountNumber,
        bankIFSCCode: formData.ifsc,
        bankAddress: formData.address,
      }

      const { data } = await api.post('/add-bank-info', payload)

      if (data?.code === 200 || data?.code === 201) {
        toast.success(data?.message || 'Bank details updated successfully!', {
          duration: 3000,
          style: toastStyle,
        })
        // Cache in localStorage as fallback
        localStorage.setItem('bankName', formData.bankName)
        localStorage.setItem('accountHolderName', formData.accountHolderName)
        localStorage.setItem('accountNumber', formData.accountNumber)
        localStorage.setItem('bankIfsc', formData.ifsc)
        localStorage.setItem('bankAddress', formData.address)

        setIsEditing(false)
      } else {
        toast.error(data?.message || 'Failed to update bank details', {
          duration: 3000,
          style: toastStyle,
        })
      }
    } catch (error) {
      console.error('Error updating bank info:', error)
      toast.error(error?.response?.data?.message || error.message || 'Failed to update bank details', {
        duration: 3000,
        style: toastStyle,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.bankContainer}>
      <div>
        <span></span>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Change Bank Account'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="bank-name">Bank Name</label>
          <input
            id="bank-name"
            name="bankName"
            type="text"
            placeholder="Enter Bank Name"
            value={formData.bankName}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label htmlFor="account-holder-name">Bank Account Holder Name</label>
          <input
            id="account-holder-name"
            name="accountHolderName"
            type="text"
            placeholder="Enter Account Holder Name"
            value={formData.accountHolderName}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label htmlFor="account-number">Bank Account Number</label>
          <input
            id="account-number"
            name="accountNumber"
            type="text"
            placeholder="Enter Account Number"
            value={formData.accountNumber}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label htmlFor="bank-ifsc">Bank IFSC</label>
          <input
            id="bank-ifsc"
            name="ifsc"
            type="text"
            placeholder="Enter IFSC Code"
            value={formData.ifsc}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label htmlFor="bank-address">Bank Address</label>
          <input
            id="bank-address"
            name="address"
            type="text"
            placeholder="Enter Bank Branch Address"
            value={formData.address}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        {isEditing && (
          <button type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update'}
          </button>
        )}
      </form>
    </div>
  )
}

export default BankAccount

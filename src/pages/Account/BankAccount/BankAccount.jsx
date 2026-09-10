import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/api'
import styles from './BankAccount.module.css'

const BankAccount = () => {
  const { user, userId } = useAuth()
  const [bankAccount, setBankAccount] = useState(null)

  console.log("userId in bank account page ", userId)

  useEffect(() => {
    if (!userId) return

    const fetchBankInfo = async () => {
      try {
        const { data } = await api.post('/bank-info', { user_id: userId })
        setBankAccount(data?.data || {})
        console.log('Fetched bank info:', data?.data)
      } catch (error) {
        console.error('Error fetching bank info', error)
      }
    }

    fetchBankInfo()
  }, [userId])

  const account = bankAccount || user || {}

  const savedBankAccount = {
    bankName: account.bank_name || account.bankName || localStorage.getItem('bankName') || '',
    branchName:
      account.bank_branch_name ||
      account.branch_name ||
      '',
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
  }

  return (
    <div className={styles.bankContainer}>
      <div>
        <span></span>
        {/* <button>change bank account</button> */}
      </div>

      <form action="">
        <div>
          <label htmlFor="bank-name">Bank Name</label>
          <input id="bank-name" type="text" value={savedBankAccount.bankName} readOnly />
        </div>

        {/* <div>
          <label htmlFor="bank-branch-name">Bank Branch Name</label>
          <input id="bank-branch-name" type="text" value={savedBankAccount.branchName} readOnly />
        </div> */}

        <div>
          <label htmlFor="account-holder-name">Bank Account Holder Name</label>
          <input id="account-holder-name" type="text" value={savedBankAccount.accountHolderName} readOnly />
        </div>

        <div>
          <label htmlFor="account-number">Bank Account Number</label>
          <input id="account-number" type="text" value={savedBankAccount.accountNumber} readOnly />
        </div>

        <div>
          <label htmlFor="bank-ifsc">Bank IFSC</label>
          <input id="bank-ifsc" type="text" value={savedBankAccount.ifsc} readOnly />
        </div>

        <div>
          <label htmlFor="bank-address">Bank Address</label>
          <input id="bank-address" type="text" value={savedBankAccount.address} readOnly />
        </div>

        {/* <button>update</button> */}
      </form>
    </div>
  )
}

export default BankAccount

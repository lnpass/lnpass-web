import { ProviderProps, createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { HDKey } from '@scure/bip32'
import { lnpassAccountDerivationPath } from '../utils/lnpass'
import { LnpassId, lnpassIdToSeed } from '../utils/lnpassId'

interface AccountsContextEntry {
  accounts?: Account[]
  addNewAccount: () => void
  restoreAccount: (path: string, partial?: Partial<Account>) => void
}

const createNewAccount = (parentKey: HDKey, path: string): Account => {
  const hdKey = parentKey.derive(path)
  return {
    name: `Identity #${hdKey.index}`,
    path,
    hdKey,
  }
}

const createNextAccount = (masterKey: HDKey, current?: Account[]) => {
  if (!current || current.length === 0) {
    return createAccountWith(masterKey, lnpassAccountDerivationPath(0))
  } else {
    const lastAccount = current[current.length - 1]
    return createAccountWith(masterKey, lnpassAccountDerivationPath(lastAccount.hdKey.index + 1))
  }
}

const createAccountWith = (masterKey: HDKey, path: string, partial?: Partial<Account>) => {
  return { ...createNewAccount(masterKey, path), ...partial }
}

const AccountsContext = createContext<AccountsContextEntry | undefined>(undefined)

interface AccountsProviderProps {
  lnpassId?: LnpassId
}

const AccountsProvider = ({ value: { lnpassId }, children }: ProviderProps<AccountsProviderProps>) => {
  const seed = useMemo(() => lnpassId && lnpassIdToSeed(lnpassId), [lnpassId])
  const masterKey = useMemo(() => seed && HDKey.fromMasterSeed(seed), [seed])
  
  const [accounts, setAccounts] = useState<Account[]>()

  useEffect(() => {
    // reset accounts if master key changes
    setAccounts(undefined)
  }, [masterKey])

  // TODO: should get entropy via https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
  const addNewAccount = useCallback(() => {
    if (masterKey === undefined) {
      throw new Error('Cannot add account: Key not available')
    }
    
    setAccounts((current) => {
      return [...(current || []), createNextAccount(masterKey, current)]
    })
  }, [masterKey])

  const restoreAccount = useCallback((path: string, partial?: Partial<Account>) => {
    if (masterKey === undefined) {
      throw new Error('Cannot add account: Key not available')
    }

    setAccounts((current) => {
      return [...(current || []), createAccountWith(masterKey, path, partial)]
    })
  }, [masterKey])

  return (
    <AccountsContext.Provider value={{ 
      accounts,
      addNewAccount,
      restoreAccount
      }}>
      <>{children}</>
    </AccountsContext.Provider>
  )
}

const useAccountsContext = () => {
  const context = useContext(AccountsContext)
  if (context === undefined) {
    throw new Error('useAccountsContext must be used within a AccountsProvider')
  }
  return context
}

export { AccountsContext, AccountsProvider, useAccountsContext }

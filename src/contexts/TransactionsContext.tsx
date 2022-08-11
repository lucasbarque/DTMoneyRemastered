import { createContext, useEffect, useState } from 'react';
import { api } from '../lib/axios';

interface Transaction {
  id: number;
  description: string;
  type: 'income' | 'outcome';
  price: number;
  category: string;
  createdAt: string;
}

type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt'>;

interface TransactionContextType {
  transactions: Transaction[];
  fetchTransactions: (query?: string) => Promise<void>;
  createTransaction: (transaction: CreateTransactionInput) => Promise<void>;
}

interface TransactionsProviderProps {
  children: React.ReactNode;
}

export const TransactionsContext = createContext({} as TransactionContextType);

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function fetchTransactions(query?: string) {
    const { data } = await api.get('/transactions', {
      params: {
        _sort: 'createdAt',
        _order: 'desc',
        q: query,
      },
    });

    setTransactions(data);
  }

  async function createTransaction({
    description,
    type,
    category,
    price,
  }: CreateTransactionInput) {
    const { data } = await api.post('/transactions', {
      description,
      type,
      category,
      price,
      createdAt: new Date(),
    });

    setTransactions((state) => [data, ...state]);
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionsContext.Provider
      value={{ transactions, createTransaction, fetchTransactions }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

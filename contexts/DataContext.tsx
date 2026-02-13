import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    Transaction,
    Expense,
    Consultant,
    Vendor,
    Personnel,
    SalaryPayment,
    SystemLog
} from '../types';
import api from '../services/api';

interface DataContextType {
    transactions: Transaction[];
    expenses: Expense[];
    consultants: Consultant[];
    vendors: Vendor[];
    personnel: Personnel[];
    payments: SalaryPayment[];
    logs: SystemLog[];
    loading: boolean;
    error: string | null;

    // Actions
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;

    addConsultant: (consultant: Omit<Consultant, 'id'>) => Promise<void>;
    updateConsultant: (id: string, consultant: Partial<Consultant>) => Promise<void>;
    deleteConsultant: (id: string) => Promise<void>;

    addVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
    updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
    deleteVendor: (id: string) => Promise<void>;

    addPersonnel: (person: Omit<Personnel, 'id'>) => Promise<void>;
    updatePersonnel: (id: string, person: Partial<Personnel>) => Promise<void>;
    deletePersonnel: (id: string) => Promise<void>;

    addPayment: (payment: SalaryPayment) => Promise<void>;

    refreshData: () => Promise<void>;
    refreshLogs: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [payments, setPayments] = useState<SalaryPayment[]>([]); // Backend API needed for this
    const [logs, setLogs] = useState<SystemLog[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                api.get('/transactions'),
                api.get('/expenses'),
                api.get('/consultants'),
                api.get('/vendors'),
                api.get('/personnel'),
                api.get('/logs'),
                api.get('/salary-payments')
            ]);

            // Her endpoint bağımsız — biri başarısız olsa bile diğerleri yüklenir
            if (results[0].status === 'fulfilled') setTransactions(results[0].value.data);
            if (results[1].status === 'fulfilled') setExpenses(results[1].value.data);
            if (results[2].status === 'fulfilled') setConsultants(results[2].value.data);
            if (results[3].status === 'fulfilled') setVendors(results[3].value.data);
            if (results[4].status === 'fulfilled') setPersonnel(results[4].value.data);
            if (results[5].status === 'fulfilled') setLogs(results[5].value.data);
            if (results[6].status === 'fulfilled') setPayments(results[6].value.data);

            const failedCount = results.filter(r => r.status === 'rejected').length;
            if (failedCount > 0) {
                console.warn(`${failedCount} API çağrısı başarısız oldu.`);
            }
            setError(null);
        } catch (err) {
            console.error('Veri çekme hatası:', err);
            setError('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, []);

    // --- TRANSACTIONS ---
    const addTransaction = async (data: Omit<Transaction, 'id'>) => {
        await api.post('/transactions', data);
        await fetchData();
    };

    const updateTransaction = async (id: string, data: Partial<Transaction>) => {
        await api.put(`/transactions/${id}`, data);
        await fetchData();
    };

    const deleteTransaction = async (id: string) => {
        await api.delete(`/transactions/${id}`);
        await fetchData();
    };

    // --- EXPENSES ---
    const addExpense = async (data: Omit<Expense, 'id'>) => {
        await api.post('/expenses', data);
        await fetchData();
    };

    const updateExpense = async (id: string, data: Partial<Expense>) => {
        await api.put(`/expenses/${id}`, data);
        await fetchData();
    };

    const deleteExpense = async (id: string) => {
        await api.delete(`/expenses/${id}`);
        await fetchData();
    };

    // --- CONSULTANTS ---
    const addConsultant = async (data: Omit<Consultant, 'id'>) => {
        console.log("Sending consultant data:", data); // Debug log
        try {
            await api.post('/consultants', data);
            await fetchData();
        } catch (error) {
            console.error("Failed to add consultant:", error);
            throw error;
        }
    };

    const updateConsultant = async (id: string, data: Partial<Consultant>) => {
        await api.put(`/consultants/${id}`, data);
        await fetchData();
    };

    const deleteConsultant = async (id: string) => {
        await api.delete(`/consultants/${id}`);
        await fetchData();
    };

    // --- VENDORS ---
    const addVendor = async (data: Omit<Vendor, 'id'>) => {
        await api.post('/vendors', data);
        await fetchData();
    };

    const updateVendor = async (id: string, data: Partial<Vendor>) => {
        await api.put(`/vendors/${id}`, data);
        await fetchData();
    };

    const deleteVendor = async (id: string) => {
        await api.delete(`/vendors/${id}`);
        await fetchData();
    };

    // --- PERSONNEL ---
    const addPersonnel = async (data: Omit<Personnel, 'id'>) => {
        await api.post('/personnel', data);
        await fetchData();
    };

    const updatePersonnel = async (id: string, data: Partial<Personnel>) => {
        await api.put(`/personnel/${id}`, data);
        await fetchData();
    };

    const deletePersonnel = async (id: string) => {
        await api.delete(`/personnel/${id}`);
        await fetchData();
    };

    // --- PAYMENTS ---
    const addPayment = async (payment: SalaryPayment) => {
        await api.post('/salary-payments', payment);
        await fetchData();
    };

    const refreshLogs = async () => {
        try {
            const res = await api.get('/logs');
            setLogs(res.data);
        } catch (error) {
            console.error("Logs refresh failed", error);
        }
    };

    return (
        <DataContext.Provider value={{
            transactions, expenses, consultants, vendors, personnel, payments, logs,
            loading, error,
            addTransaction, updateTransaction, deleteTransaction,
            addExpense, updateExpense, deleteExpense,
            addConsultant, updateConsultant, deleteConsultant,
            addVendor, updateVendor, deleteVendor,
            addPersonnel, updatePersonnel, deletePersonnel,
            addPayment,
            refreshData: fetchData,
            refreshLogs
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

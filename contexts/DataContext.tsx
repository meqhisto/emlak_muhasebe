import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    Transaction, Expense, Consultant, Vendor, Personnel, SalaryPayment, SystemLog
} from '../types';
import {
    INITIAL_TRANSACTIONS, INITIAL_EXPENSES, INITIAL_CONSULTANTS, INITIAL_VENDORS, INITIAL_PERSONNEL, INITIAL_SALARY_PAYMENTS
} from '../constants';
import { useSystemLog } from '../hooks/useSystemLog';
import { useAuth } from './AuthContext';

interface DataContextType {
    transactions: Transaction[] | null;
    expenses: Expense[] | null;
    consultants: Consultant[] | null;
    vendors: Vendor[] | null;
    personnel: Personnel[] | null;
    payments: SalaryPayment[] | null;
    logs: SystemLog[];

    // Actions
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (transaction: Transaction) => void;
    deleteTransaction: (id: string) => void;
    addExpense: (expense: Expense) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    addConsultant: (consultant: Consultant) => void;
    updateConsultant: (consultant: Consultant) => void;
    addVendor: (vendor: Vendor) => void;
    updateVendor: (vendor: Vendor) => void;
    addPersonnel: (personnel: Personnel) => void;
    updatePersonnel: (personnel: Personnel) => void;
    addPayment: (payment: SalaryPayment) => void;
    refreshLogs: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { logAction } = useSystemLog(currentUser);

    // State Definitions
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [expenses, setExpenses] = useState<Expense[] | null>(null);
    const [consultants, setConsultants] = useState<Consultant[] | null>(null);
    const [vendors, setVendors] = useState<Vendor[] | null>(null);
    const [personnel, setPersonnel] = useState<Personnel[] | null>(null);
    const [payments, setPayments] = useState<SalaryPayment[] | null>(null);
    const [logs, setLogs] = useState<SystemLog[]>([]);

    // Load Data on Mount
    useEffect(() => {
        const loadData = () => {
            const storedTransactions = localStorage.getItem('emlak_transactions');
            setTransactions(storedTransactions ? JSON.parse(storedTransactions) : INITIAL_TRANSACTIONS);

            const storedExpenses = localStorage.getItem('emlak_expenses');
            setExpenses(storedExpenses ? JSON.parse(storedExpenses) : INITIAL_EXPENSES);

            const storedConsultants = localStorage.getItem('emlak_consultants');
            setConsultants(storedConsultants ? JSON.parse(storedConsultants) : INITIAL_CONSULTANTS);

            const storedVendors = localStorage.getItem('emlak_vendors');
            setVendors(storedVendors ? JSON.parse(storedVendors) : INITIAL_VENDORS);

            const storedPersonnel = localStorage.getItem('emlak_personnel');
            setPersonnel(storedPersonnel ? JSON.parse(storedPersonnel) : INITIAL_PERSONNEL);

            const storedPayments = localStorage.getItem('emlak_salary_payments');
            setPayments(storedPayments ? JSON.parse(storedPayments) : INITIAL_SALARY_PAYMENTS);

            refreshLogs();
        };

        loadData();
    }, []);

    // Persistence Effects
    useEffect(() => {
        if (transactions !== null) localStorage.setItem('emlak_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        if (expenses !== null) localStorage.setItem('emlak_expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        if (consultants !== null) localStorage.setItem('emlak_consultants', JSON.stringify(consultants));
    }, [consultants]);

    useEffect(() => {
        if (vendors !== null) localStorage.setItem('emlak_vendors', JSON.stringify(vendors));
    }, [vendors]);

    useEffect(() => {
        if (personnel !== null) localStorage.setItem('emlak_personnel', JSON.stringify(personnel));
    }, [personnel]);

    useEffect(() => {
        if (payments !== null) localStorage.setItem('emlak_salary_payments', JSON.stringify(payments));
    }, [payments]);

    // Actions
    const refreshLogs = useCallback(() => {
        const storedLogs = localStorage.getItem('emlak_logs');
        setLogs(storedLogs ? JSON.parse(storedLogs) : []);
    }, []);

    const addTransaction = (transaction: Transaction) => {
        setTransactions(prev => [transaction, ...(prev || [])]);
        logAction('CREATE', `Yeni İşlem: ${transaction.propertyName}`, 'TRANSACTION');
        refreshLogs();
    };

    const updateTransaction = (transaction: Transaction) => {
        setTransactions(prev => (prev || []).map(t => t.id === transaction.id ? transaction : t));
        logAction('UPDATE', `İşlem Güncellendi: ${transaction.propertyName}`, 'TRANSACTION');
        refreshLogs();
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => (prev || []).filter(t => t.id !== id));
        logAction('DELETE', `İşlem Silindi: ID ${id}`, 'TRANSACTION');
        refreshLogs();
    };

    const addExpense = (expense: Expense) => {
        setExpenses(prev => [expense, ...(prev || [])]);
        logAction('CREATE', `Yeni Gider: ${expense.description}`, 'EXPENSE');
        refreshLogs();
    };

    const updateExpense = (expense: Expense) => {
        setExpenses(prev => (prev || []).map(e => e.id === expense.id ? expense : e));
        logAction('UPDATE', `Gider Güncellendi: ${expense.description}`, 'EXPENSE');
        refreshLogs();
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => (prev || []).filter(e => e.id !== id));
        logAction('DELETE', `Gider Silindi: ID ${id}`, 'EXPENSE');
        refreshLogs();
    };

    const addConsultant = (consultant: Consultant) => {
        setConsultants(prev => [...(prev || []), consultant]);
        logAction('CREATE', `Yeni Danışman: ${consultant.fullName}`, 'CONSULTANT');
        refreshLogs();
    };

    const updateConsultant = (consultant: Consultant) => {
        setConsultants(prev => (prev || []).map(c => c.id === consultant.id ? consultant : c));
        logAction('UPDATE', `Danışman Güncellendi: ${consultant.fullName}`, 'CONSULTANT');
        refreshLogs();
    };

    const addVendor = (vendor: Vendor) => {
        setVendors(prev => [...(prev || []), vendor]);
        logAction('CREATE', `Yeni Firma: ${vendor.name}`, 'VENDOR');
        refreshLogs();
    };

    const updateVendor = (vendor: Vendor) => {
        setVendors(prev => (prev || []).map(v => v.id === vendor.id ? vendor : v));
        logAction('UPDATE', `Firma Güncellendi: ${vendor.name}`, 'VENDOR');
        refreshLogs();
    };

    const addPersonnel = (newPersonnel: Personnel) => {
        setPersonnel(prev => [...(prev || []), newPersonnel]);
        logAction('CREATE', `Yeni Personel: ${newPersonnel.fullName}`, 'PERSONNEL');
        refreshLogs();
    };

    const updatePersonnel = (updatedPersonnel: Personnel) => {
        setPersonnel(prev => (prev || []).map(p => p.id === updatedPersonnel.id ? updatedPersonnel : p));
        logAction('UPDATE', `Personel Güncellendi: ${updatedPersonnel.fullName}`, 'PERSONNEL');
        refreshLogs();
    };

    const addPayment = (payment: SalaryPayment) => {
        setPayments(prev => [payment, ...(prev || [])]);
        // Logging is handled by the component or we can add it here if we pass description
        refreshLogs();
    };

    return (
        <DataContext.Provider value={{
            transactions, expenses, consultants, vendors, personnel, payments, logs,
            addTransaction, deleteTransaction,
            addExpense, updateExpense, deleteExpense,
            addConsultant, updateConsultant,
            addVendor, updateVendor,
            addPersonnel, updatePersonnel,
            addPayment,
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

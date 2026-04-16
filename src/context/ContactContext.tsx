import { createContext, useContext, useState, useCallback } from "react";
import contactAPI, { type Contact } from "../services/api/contactApi";

interface ContactContextType {
  contacts: Contact[];
  pagination: { total: number; page: number; totalPages: number } | null;
  loading: boolean;
  error: string | null;
  // Public
  submitContact: (data: {
    name: string;
    message: string;
    email?: string;
    phone_number?: string;
    subject?: string;
    type?: string;
  }) => Promise<void>;
  // Admin
  fetchContacts: (page?: number, limit?: number) => Promise<void>;
  fetchContact: (id: number) => Promise<Contact>;
  deleteContact: (id: number) => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContact = useCallback(
    async (data: Parameters<typeof contactAPI.submitContact>[0]) => {
      setLoading(true);
      setError(null);
      try {
        await contactAPI.submitContact(data);
      } catch (e: any) {
        setError(e.response?.data?.message || "Failed to submit contact");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchContacts = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const res = await contactAPI.getAllContacts(page, limit);
      setContacts(res.data.contacts);
      setPagination(res.data.pagination);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContact = useCallback(async (id: number) => {
    const res = await contactAPI.getContact(id);
    return res.data;
  }, []);

  const deleteContact = useCallback(
    async (id: number) => {
      await contactAPI.deleteContact(id);
      await fetchContacts(); // refetch
    },
    [fetchContacts],
  );

  return (
    <ContactContext.Provider
      value={{
        contacts,
        pagination,
        loading,
        error,
        submitContact,
        fetchContacts,
        fetchContact,
        deleteContact,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used within ContactProvider");
  return ctx;
}

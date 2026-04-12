import { useState, useCallback, useEffect } from "react";
import apiClient from "../services/axios";
import type {
  AdminTab,
  Admin,
  Contact,
  News,
  Emergency,
  TransparencyDoc,
  BeneficiaryStats,
  Donation,
  DonationStats,
} from "../types/admin";

export interface AdminData {
  contacts: Contact[];
  news: News[];
  emergencies: Emergency[];
  transparencyDocs: TransparencyDoc[];
  admins: Admin[];
  beneficiaryStats: BeneficiaryStats | null;
  donations: Donation[];
  donationStats: DonationStats | null;
  loadingData: boolean;
}

export interface RefetchFunctions {
  refetchContacts: () => Promise<void>;
  refetchNews: () => Promise<void>;
  refetchEmergencies: () => Promise<void>;
  refetchTransparency: () => Promise<void>;
  refetchAdmins: () => Promise<void>;
  refetchBeneficiaryStats: () => Promise<void>;
  refetchDonations: () => Promise<void>;
}

export function useAdminData(
  activeTab: AdminTab,
  isSuperAdmin: boolean,
): AdminData & RefetchFunctions {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [transparencyDocs, setTransparencyDocs] = useState<TransparencyDoc[]>(
    [],
  );
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [beneficiaryStats, setBeneficiaryStats] =
    useState<BeneficiaryStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(
    null,
  );
  const [loadingData, setLoadingData] = useState(false);

  const refetchContacts = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/contacts");
    setContacts(res.data.data);
  }, []);

  const refetchNews = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/news");
    setNews(res.data.data);
  }, []);

  const refetchEmergencies = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/emergencies");
    setEmergencies(res.data.data);
  }, []);

  const refetchTransparency = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/transparency");
    setTransparencyDocs(res.data.data);
  }, []);

  const refetchAdmins = useCallback(async () => {
    const res = await apiClient.get("/v1/admin");
    setAdmins(res.data.data);
  }, []);

  const refetchBeneficiaryStats = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/beneficiary-stats");
    setBeneficiaryStats(res.data.data);
  }, []);

  const refetchDonations = useCallback(async () => {
    const [donationsRes, donationStatsRes] = await Promise.all([
      apiClient.get("/v1/admin/donations"),
      apiClient.get("/v1/admin/donations/stats"),
    ]);
    setDonations(donationsRes.data.data);
    setDonationStats(donationStatsRes.data.data);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        switch (activeTab) {
          case "contacts":
            await refetchContacts();
            break;
          case "news":
            await Promise.all([refetchNews(), refetchEmergencies()]);
            break;
          case "transparency":
            await refetchTransparency();
            break;
          case "admins":
            if (isSuperAdmin) await refetchAdmins();
            break;
          case "beneficiaries":
            await refetchBeneficiaryStats();
            break;
          case "donations":
          case "audit":
          case "dashboard":
            await refetchDonations();
            break;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [
    activeTab,
    isSuperAdmin,
    refetchContacts,
    refetchNews,
    refetchEmergencies,
    refetchTransparency,
    refetchAdmins,
    refetchBeneficiaryStats,
    refetchDonations,
  ]);

  return {
    contacts,
    news,
    emergencies,
    transparencyDocs,
    admins,
    beneficiaryStats,
    donations,
    donationStats,
    loadingData,
    refetchContacts,
    refetchNews,
    refetchEmergencies,
    refetchTransparency,
    refetchAdmins,
    refetchBeneficiaryStats,
    refetchDonations,
  };
}

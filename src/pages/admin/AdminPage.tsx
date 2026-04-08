import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  DollarSign,
  Upload,
  Bell,
  LogOut,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart,
  Plus,
  Search,
  ChevronRight,
  Home,
  Shield,
  MessageSquare,
  AlertCircle,
  Menu,
  X,
  Edit,
  Trash2,
  Eye,
  Save,
  Loader2,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useToast } from "../../components/Toast";
import apiClient from "../../services/axios";
import type { Admin } from "../../services/api/adminApi";
import type { Contact } from "../../services/api/contactApi";
import type { News } from "../../services/api/newsApi";
import type { Emergency } from "../../services/api/emergencyApi";
import type { TransparencyDoc } from "../../services/api/transparencyApi";
import type { BeneficiaryStats } from "../../services/api/beneficiaryStatsApi";
import type { Donation, DonationStats } from "../../services/api/donationApi";

import { StatCard } from "../../components/admin/StatCard";
import { AdminTable, Column } from "../../components/admin/AdminTable";
import { AdminManagementModal } from "../../components/admin/modals/AdminManagementModal";
import { useCRUDModalState } from "../../hooks/useModalState";

type AdminTab =
  | "dashboard"
  | "donations"
  | "beneficiaries"
  | "news"
  | "audit"
  | "transparency"
  | "contacts"
  | "settings"
  | "admins";

interface Tab {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSuperAdmin?: boolean;
}

export function AdminPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { logout, admin } = useAdminAuth();
  const { showToast } = useToast();

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  const getInitialTab = (): AdminTab => {
    if (tab && ["dashboard", "donations", "beneficiaries", "news", "audit", "transparency", "contacts", "settings", "admins"].includes(tab)) {
      return tab as AdminTab;
    }
    return "dashboard";
  };

  const [activeTab, setActiveTabState] = useState<AdminTab>(getInitialTab);

  const setActiveTab = useCallback((newTab: AdminTab) => {
    setActiveTabState(newTab);
    navigate(`/admin/${newTab}`);
  }, [navigate]);

  const adminModal = useCRUDModalState<Admin>();

  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);

  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingEmergency, setEditingEmergency] = useState<Emergency | null>(
    null,
  );
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [beneficiaryForm, setBeneficiaryForm] = useState({
    total_beneficiaries: 0,
    countries_count: 0,
  });
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    image_url: "",
  });
  const [emergencyForm, setEmergencyForm] = useState({
    title: "",
    description: "",
    target_amount: 0,
    deadline: "",
  });
  const [transparencyForm, setTransparencyForm] = useState({
    title: "",
    file_type: "annual_report" as const,
    file: null as File | null,
  });

  const tabs: Tab[] = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "donations", label: "Donations", icon: DollarSign },
      { id: "beneficiaries", label: "Beneficiaries", icon: Users },
      { id: "news", label: "News & Emergencies", icon: FileText },
      { id: "audit", label: "Financial Audit", icon: BarChart3 },
      { id: "transparency", label: "Transparency", icon: Upload },
      { id: "contacts", label: "Contacts", icon: Bell },
      { id: "settings", label: "Settings", icon: Settings },
      ...(isSuperAdmin
        ? [
            {
              id: "admins" as AdminTab,
              label: "Admin Management",
              icon: Shield,
            },
          ]
        : []),
    ],
    [isSuperAdmin],
  );

  const fetchContacts = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/contacts");
    setContacts(res.data.data);
  }, []);

  const fetchNewsAndEmergencies = useCallback(async () => {
    const [newsRes, emergenciesRes] = await Promise.all([
      apiClient.get("/v1/admin/news"),
      apiClient.get("/v1/admin/emergencies"),
    ]);
    setNews(newsRes.data.data);
    setEmergencies(emergenciesRes.data.data);
  }, []);

  const fetchTransparency = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/transparency");
    setTransparencyDocs(res.data.data);
  }, []);

  const fetchAdmins = useCallback(async () => {
    const res = await apiClient.get("/v1/admin");
    setAdmins(res.data.data);
  }, []);

  const fetchBeneficiaryStats = useCallback(async () => {
    const res = await apiClient.get("/v1/admin/beneficiary-stats");
    setBeneficiaryStats(res.data.data);
  }, []);

  const fetchDonations = useCallback(async () => {
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
            await fetchContacts();
            break;
          case "news":
            await fetchNewsAndEmergencies();
            break;
          case "transparency":
            await fetchTransparency();
            break;
          case "admins":
            if (isSuperAdmin) await fetchAdmins();
            break;
          case "beneficiaries":
            await fetchBeneficiaryStats();
            break;
          case "donations":
            await fetchDonations();
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
    fetchContacts,
    fetchNewsAndEmergencies,
    fetchTransparency,
    fetchAdmins,
    fetchBeneficiaryStats,
    fetchDonations,
    isSuperAdmin,
  ]);

  const filteredContacts = useMemo(
    () =>
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.subject?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [contacts, searchQuery],
  );

  const filteredNews = useMemo(
    () =>
      news.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [news, searchQuery],
  );

  const filteredEmergencies = useMemo(
    () =>
      emergencies.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [emergencies, searchQuery],
  );

  const handleBeneficiarySave = async () => {
    setLoading(true);
    try {
      await apiClient.put("/v1/admin/beneficiary-stats", beneficiaryForm);
      const res = await apiClient.get("/v1/admin/beneficiary-stats");
      setBeneficiaryStats(res.data.data);
      setShowBeneficiaryModal(false);
      showToast("success", "Beneficiary stats updated successfully!");
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to update beneficiary stats",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewsSave = async () => {
    setLoading(true);
    try {
      if (editingNews) {
        await apiClient.put(`/v1/admin/news/${editingNews.id}`, newsForm);
        showToast("success", "News updated successfully!");
      } else {
        await apiClient.post("/v1/admin/news", newsForm);
        showToast("success", "News created successfully!");
      }
      const res = await apiClient.get("/v1/admin/news");
      setNews(res.data.data);
      setShowNewsModal(false);
      setEditingNews(null);
      setNewsForm({ title: "", content: "", image_url: "" });
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to save news",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewsDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this news?")) return;
    setLoading(true);
    try {
      await apiClient.delete(`/v1/admin/news/${id}`);
      const res = await apiClient.get("/v1/admin/news");
      setNews(res.data.data);
      showToast("success", "News deleted successfully!");
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete news",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySave = async () => {
    setLoading(true);
    try {
      if (editingEmergency) {
        await apiClient.put(
          `/v1/admin/emergencies/${editingEmergency.id}`,
          emergencyForm,
        );
        showToast("success", "Emergency updated successfully!");
      } else {
        await apiClient.post("/v1/admin/emergencies", emergencyForm);
        showToast("success", "Emergency created successfully!");
      }
      const res = await apiClient.get("/v1/admin/emergencies");
      setEmergencies(res.data.data);
      setShowNewsModal(false);
      setEditingEmergency(null);
      setEmergencyForm({
        title: "",
        description: "",
        target_amount: 0,
        deadline: "",
      });
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to save emergency",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this emergency?")) return;
    setLoading(true);
    try {
      await apiClient.delete(`/v1/admin/emergencies/${id}`);
      const res = await apiClient.get("/v1/admin/emergencies");
      setEmergencies(res.data.data);
      showToast("success", "Emergency deleted successfully!");
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete emergency",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContactView = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const handleContactDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    setLoading(true);
    try {
      await apiClient.delete(`/v1/admin/contacts/${id}`);
      const res = await apiClient.get("/v1/admin/contacts");
      setContacts(res.data.data);
      showToast("success", "Contact deleted successfully!");
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete contact",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTransparencyUpload = async () => {
    if (!transparencyForm.file || !transparencyForm.title) {
      showToast("error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", transparencyForm.file);
      formData.append("title", transparencyForm.title);
      formData.append("file_type", transparencyForm.file_type);
      await apiClient.post("/v1/admin/transparency", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await apiClient.get("/v1/admin/transparency");
      setTransparencyDocs(res.data.data);
      setShowTransparencyModal(false);
      setTransparencyForm({
        title: "",
        file_type: "annual_report",
        file: null,
      });
      showToast("success", "Document uploaded successfully!");
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to upload document",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTransparencyDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setLoading(true);
    try {
      await apiClient.delete(`/v1/admin/transparency/${id}`);
      const res = await apiClient.get("/v1/admin/transparency");
      setTransparencyDocs(res.data.data);
      showToast("success", "Document deleted successfully!");
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete document",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminSave = async (data: {
    email: string;
    password: string;
    role: "ADMIN" | "SUPER_ADMIN";
  }) => {
    if (!data.email) {
      showToast("error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      if (adminModal.mode === "edit" && adminModal.selectedItem) {
        await apiClient.put(`/v1/admin/${adminModal.selectedItem.id}`, {
          email: data.email,
          role: data.role,
        });
        showToast("success", "Admin updated successfully!");
      } else {
        await apiClient.post("/v1/admin", data);
        showToast("success", "Admin created successfully!");
      }
      const res = await apiClient.get("/v1/admin");
      setAdmins(res.data.data);
      adminModal.close();
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to save admin",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDelete = async (id: number) => {
    setLoading(true);
    try {
      await apiClient.delete(`/v1/admin/${id}`);
      const res = await apiClient.get("/v1/admin");
      setAdmins(res.data.data);
      showToast("success", "Admin deleted successfully!");
      adminModal.close();
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete admin",
      );
    } finally {
      setLoading(false);
    }
  };

  const openNewsModal = (item?: News) => {
    if (item) {
      setEditingNews(item);
      setNewsForm({
        title: item.title,
        content: item.content,
        image_url: item.image_url || "",
      });
    } else {
      setEditingNews(null);
      setNewsForm({ title: "", content: "", image_url: "" });
    }
    setShowNewsModal(true);
  };

  const openEmergencyModal = (item?: Emergency) => {
    if (item) {
      setEditingEmergency(item);
      setEmergencyForm({
        title: item.title,
        description: item.description,
        target_amount: item.target_amount || 0,
        deadline: item.deadline || "",
      });
    } else {
      setEditingEmergency(null);
      setEmergencyForm({
        title: "",
        description: "",
        target_amount: 0,
        deadline: "",
      });
    }
    setShowNewsModal(true);
  };

  const stats = [
    {
      label: "Total Beneficiaries",
      value: beneficiaryStats?.total_beneficiaries?.toLocaleString() || "0",
      change: "+12%",
      icon: Users,
      color: "bg-[#B91C1C]",
    },
    {
      label: "News Articles",
      value: news.length.toString(),
      change: "+5%",
      icon: FileText,
      color: "bg-[#15803d]",
    },
    {
      label: "Active Emergencies",
      value: emergencies.filter((e) => e.is_active).length.toString(),
      change: "-2",
      icon: Bell,
      color: "bg-[#f59e0b]",
    },
    {
      label: "Total Donations",
      value: `$${donationStats?.totalAmount?.toLocaleString() || "0"}`,
      change: "+23%",
      icon: DollarSign,
      color: "bg-[#7c3aed]",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New beneficiary registered",
      time: "2 minutes ago",
      type: "success" as const,
    },
    {
      id: 2,
      action: "News article published",
      time: "1 hour ago",
      type: "info" as const,
    },
    {
      id: 3,
      action: "Emergency update added",
      time: "3 hours ago",
      type: "warning" as const,
    },
    {
      id: 4,
      action: "New volunteer application",
      time: "5 hours ago",
      type: "success" as const,
    },
    {
      id: 5,
      action: "Transparency report uploaded",
      time: "1 day ago",
      type: "info" as const,
    },
  ];

  const Modal = ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const FormInput = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
    textarea,
  }: any) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-[#B91C1C]">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
        />
      )}
    </div>
  );

  const adminColumns: Column<Admin>[] = [
    {
      key: "email",
      header: "Email",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#991B1B] flex items-center justify-center text-white font-bold">
            {item.email.charAt(0).toUpperCase()}
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {item.email}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (item) => (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            item.role === "SUPER_ADMIN"
              ? "bg-[#7c3aed]/10 text-[#7c3aed]"
              : "bg-[#15803d]/10 text-[#15803d]"
          }`}
        >
          {item.role}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      render: (item) => (
        <p className="text-gray-500 dark:text-gray-400">
          {new Date(item.created_at).toLocaleDateString()}
        </p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              adminModal.openEdit(item);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              adminModal.openDelete(item);
            }}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a]">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#B91C1C] to-[#991B1B] flex items-center justify-center">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="font-serif text-lg md:text-xl font-bold text-[#B91C1C] hidden sm:inline">
                Hibret Lebego
              </span>
            </div>
            <span className="px-2 md:px-3 py-1 bg-[#B91C1C]/10 text-[#B91C1C] text-xs font-semibold rounded-full">
              {admin?.role || "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-sm"
              />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#B91C1C] rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="w-8 md:w-9 h-8 md:h-9 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#15803d] flex items-center justify-center text-white font-bold text-sm">
                {admin?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {admin?.email || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">{admin?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto z-40 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#B91C1C] to-[#991B1B] text-white shadow-lg shadow-[#B91C1C]/25"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="truncate">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[#B91C1C] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </aside>
      </>

      <main className="lg:ml-64 pt-16 p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl"
          >
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-[#B91C1C] to-[#991B1B] rounded-3xl p-8 text-white">
                  <h1 className="font-serif text-3xl font-bold mb-2">
                    Welcome back, {admin?.email?.split("@")[0] || "Admin"}!
                  </h1>
                  <p className="text-white/80">
                    Here's what's happening with your organization today.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                        Recent Activity
                      </h2>
                      <button className="text-[#B91C1C] text-sm font-medium hover:underline">
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "success"
                                ? "bg-green-500"
                                : activity.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {activity.action}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
                    <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Quick Actions
                    </h2>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab("beneficiaries")}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#B91C1C]/10 hover:bg-[#B91C1C] text-[#B91C1C] hover:text-white transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Add New Beneficiary
                      </button>
                      <button
                        onClick={() => setActiveTab("news")}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#15803d]/10 hover:bg-[#15803d] text-[#15803d] hover:text-white transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                        Create News Post
                      </button>
                      <button
                        onClick={() => setActiveTab("transparency")}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#7c3aed]/10 hover:bg-[#7c3aed] text-[#7c3aed] hover:text-white transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        Upload Report
                      </button>
                      <button
                        onClick={() => setActiveTab("contacts")}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        View Messages
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "donations" && (
              <DonationsTab
                donations={donations}
                donationStats={donationStats}
                loadingData={loadingData}
              />
            )}

            {activeTab === "beneficiaries" && (
              <BeneficiariesTab
                stats={beneficiaryStats}
                loadingData={loadingData}
                onEdit={() => setShowBeneficiaryModal(true)}
              />
            )}

            {activeTab === "news" && (
              <NewsTab
                news={filteredNews}
                emergencies={filteredEmergencies}
                loadingData={loadingData}
                onAddNews={() => openNewsModal()}
                onEditNews={(item) => openNewsModal(item)}
                onDeleteNews={handleNewsDelete}
                onAddEmergency={() => openEmergencyModal()}
                onEditEmergency={(item) => openEmergencyModal(item)}
                onDeleteEmergency={handleEmergencyDelete}
              />
            )}

            {activeTab === "audit" && (
              <AuditTab donations={donations} donationStats={donationStats} />
            )}

            {activeTab === "transparency" && (
              <TransparencyTab
                docs={transparencyDocs}
                loadingData={loadingData}
                onUpload={() => setShowTransparencyModal(true)}
                onDelete={handleTransparencyDelete}
              />
            )}

            {activeTab === "contacts" && (
              <ContactsTab
                contacts={filteredContacts}
                loadingData={loadingData}
                onView={handleContactView}
              />
            )}

            {activeTab === "settings" && <SettingsTab admin={admin} />}

            {activeTab === "admins" && isSuperAdmin && (
              <AdminsTab
                admins={admins}
                loadingData={loadingData}
                onAdd={() => adminModal.openCreate()}
                columns={adminColumns}
                onRowClick={(item) => adminModal.openEdit(item)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Modal
        isOpen={showBeneficiaryModal}
        onClose={() => setShowBeneficiaryModal(false)}
        title="Update Beneficiary Stats"
      >
        <div className="space-y-4">
          <FormInput
            label="Total Beneficiaries"
            type="number"
            value={beneficiaryForm.total_beneficiaries}
            onChange={(v: number) =>
              setBeneficiaryForm({
                ...beneficiaryForm,
                total_beneficiaries: Number(v),
              })
            }
            placeholder="Enter total beneficiaries"
            required
          />
          <FormInput
            label="Countries Count"
            type="number"
            value={beneficiaryForm.countries_count}
            onChange={(v: number) =>
              setBeneficiaryForm({
                ...beneficiaryForm,
                countries_count: Number(v),
              })
            }
            placeholder="Enter countries count"
            required
          />
          <button
            onClick={handleBeneficiarySave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showNewsModal}
        onClose={() => {
          setShowNewsModal(false);
          setEditingNews(null);
          setNewsForm({ title: "", content: "", image_url: "" });
        }}
        title={editingNews ? "Edit News" : "Add News"}
      >
        <div className="space-y-4">
          <FormInput
            label="Title"
            value={newsForm.title}
            onChange={(v: string) => setNewsForm({ ...newsForm, title: v })}
            placeholder="Enter news title"
            required
          />
          <FormInput
            label="Content"
            value={newsForm.content}
            onChange={(v: string) => setNewsForm({ ...newsForm, content: v })}
            placeholder="Enter news content"
            textarea
            required
          />
          <FormInput
            label="Image URL (optional)"
            value={newsForm.image_url}
            onChange={(v: string) => setNewsForm({ ...newsForm, image_url: v })}
            placeholder="Enter image URL"
          />
          <button
            onClick={handleNewsSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {editingNews ? "Update News" : "Create News"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSelectedContact(null);
        }}
        title="Contact Details"
      >
        {selectedContact && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#15803d] flex items-center justify-center text-white text-xl font-bold">
                {selectedContact.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {selectedContact.name}
                </h3>
                <span className="px-2 py-1 bg-[#B91C1C]/10 text-[#B91C1C] text-xs font-medium rounded-full">
                  {selectedContact.type}
                </span>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedContact.email}
                </p>
              </div>
              {selectedContact.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedContact.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedContact.subject}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Message</p>
                <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  handleContactDelete(selectedContact.id);
                  setShowContactModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedContact(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showTransparencyModal}
        onClose={() => {
          setShowTransparencyModal(false);
          setTransparencyForm({
            title: "",
            file_type: "annual_report",
            file: null,
          });
        }}
        title="Upload Transparency Document"
      >
        <div className="space-y-4">
          <FormInput
            label="Document Title"
            value={transparencyForm.title}
            onChange={(v: string) =>
              setTransparencyForm({ ...transparencyForm, title: v })
            }
            placeholder="Enter document title"
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Document Type <span className="text-[#B91C1C]">*</span>
            </label>
            <select
              value={transparencyForm.file_type}
              onChange={(e) =>
                setTransparencyForm({
                  ...transparencyForm,
                  file_type: e.target.value as any,
                })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
            >
              <option value="annual_report">Annual Report</option>
              <option value="audit_report">Audit Report</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              PDF File <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setTransparencyForm({
                  ...transparencyForm,
                  file: e.target.files?.[0] || null,
                })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#B91C1C] file:text-white hover:file:bg-[#991B1B]"
            />
          </div>
          <button
            onClick={handleTransparencyUpload}
            disabled={
              loading || !transparencyForm.file || !transparencyForm.title
            }
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            Upload Document
          </button>
        </div>
      </Modal>

      <AdminManagementModal
        isOpen={adminModal.isOpen}
        onClose={adminModal.close}
        admin={adminModal.selectedItem || undefined}
        onSave={handleSuperAdminSave}
        onDelete={adminModal.mode === "delete" ? handleAdminDelete : undefined}
        loading={loading}
        mode={adminModal.mode}
      />
    </div>
  );
}

function DonationsTab({
  donations,
  donationStats,
  loadingData,
}: {
  donations: Donation[];
  donationStats: DonationStats | null;
  loadingData: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#15803d] dark:text-white">
            Donations Management
          </h1>
          <p className="text-gray-500 mt-1">
            Track and manage all donation records
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-[#15803d]" />
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ${donationStats?.totalAmount?.toLocaleString() || "0"}
          </h3>
          <p className="text-gray-500 text-sm">Total Donations</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-[#7c3aed]" />
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {donationStats?.totalDonors || 0} Donors
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {donationStats?.totalDonors || 0}
          </h3>
          <p className="text-gray-500 text-sm">Total Donors</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-[#B91C1C]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ${donationStats?.averageDonation?.toFixed(2) || "0.00"}
          </h3>
          <p className="text-gray-500 text-sm">Average Donation</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
            Recent Donations
          </h2>
        </div>
        <AdminTable
          data={donations.slice(0, 10)}
          loading={loadingData}
          emptyMessage="No donations found"
          columns={[
            {
              key: "donor",
              header: "Donor",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#991B1B] flex items-center justify-center text-white font-medium">
                    {item.donor_name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.donor_name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">{item.donor_email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              render: (item) => (
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${item.amount.toFixed(2)}
                </p>
              ),
            },
            {
              key: "date",
              header: "Date",
              render: (item) => (
                <p className="text-gray-500 dark:text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (item) => (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              ),
            },
            {
              key: "tx_ref",
              header: "Transaction Ref",
              render: (item) => (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {item.tx_ref}
                </p>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function BeneficiariesTab({
  stats,
  loadingData,
  onEdit,
}: {
  stats: BeneficiaryStats | null;
  loadingData: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            Beneficiaries Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and track all beneficiaries
          </p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors shadow-lg shadow-[#B91C1C]/25"
        >
          <Edit className="w-5 h-5" />
          Update Stats
        </button>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#B91C1C]" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#B91C1C]/10 to-[#B91C1C]/5 border border-[#B91C1C]/20">
              <h3 className="text-4xl font-bold text-[#B91C1C]">
                {stats?.total_beneficiaries?.toLocaleString() || "0"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Total Beneficiaries
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#15803d]/10 to-[#15803d]/5 border border-[#15803d]/20">
              <h3 className="text-4xl font-bold text-[#15803d]">
                {stats?.countries_count || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Countries</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7c3aed]/10 to-[#7c3aed]/5 border border-[#7c3aed]/20">
              <h3 className="text-4xl font-bold text-[#7c3aed]">Active</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Program Status
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsTab({
  news,
  emergencies,
  loadingData,
  onAddNews,
  onEditNews,
  onDeleteNews,
  onAddEmergency,
  onEditEmergency,
  onDeleteEmergency,
}: {
  news: News[];
  emergencies: Emergency[];
  loadingData: boolean;
  onAddNews: () => void;
  onEditNews: (item: News) => void;
  onDeleteNews: (id: number) => void;
  onAddEmergency: () => void;
  onEditEmergency: (item: Emergency) => void;
  onDeleteEmergency: (id: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            News & Emergencies
          </h1>
          <p className="text-gray-500 mt-1">
            Manage news articles and emergency updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onAddNews}
            className="flex items-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add News
          </button>
          <button
            onClick={onAddEmergency}
            className="flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white rounded-xl font-medium hover:bg-[#d97706] transition-colors"
          >
            <Bell className="w-5 h-5" />
            Add Emergency
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5" /> News Articles
        </h2>
        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#B91C1C]" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No news articles found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-[#B91C1C]/20 to-[#15803d]/20"></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#B91C1C]/10 text-[#B91C1C] text-xs font-medium rounded-full">
                      News
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditNews(item)}
                      className="text-[#B91C1C] font-medium text-sm hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteNews(item.id)}
                      className="text-red-500 font-medium text-sm hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#f59e0b]" /> Emergencies
        </h2>
        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#f59e0b]" />
          </div>
        ) : emergencies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No emergencies found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencies.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  className={`h-2 ${
                    item.is_active ? "bg-[#f59e0b]" : "bg-gray-400"
                  }`}
                ></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.is_active
                          ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  {item.target_amount && (
                    <p className="text-sm text-[#15803d] font-medium mb-2">
                      Target: ${item.target_amount.toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditEmergency(item)}
                      className="text-[#f59e0b] font-medium text-sm hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteEmergency(item.id)}
                      className="text-red-500 font-medium text-sm hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditTab({
  donations,
  donationStats,
}: {
  donations: Donation[];
  donationStats: DonationStats | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            Financial Audit
          </h1>
          <p className="text-gray-500 mt-1">
            Track and manage financial transactions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <DollarSign className="w-8 h-8 text-[#15803d] mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ${donationStats?.totalAmount?.toLocaleString() || "0"}
          </h3>
          <p className="text-gray-500 text-sm">Total Received</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <TrendingUp className="w-8 h-8 text-[#B91C1C] mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            $180,000
          </h3>
          <p className="text-gray-500 text-sm">Total Spent</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <BarChart3 className="w-8 h-8 text-[#7c3aed] mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            $65,000
          </h3>
          <p className="text-gray-500 text-sm">Current Balance</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <PieChart className="w-8 h-8 text-[#f59e0b] mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            73%
          </h3>
          <p className="text-gray-500 text-sm">Efficiency Rate</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {donations.slice(0, 10).map((donation) => (
                <tr
                  key={donation.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Donation
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    Income
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#15803d]">
                    +${donation.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {donation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransparencyTab({
  docs,
  loadingData,
  onUpload,
  onDelete,
}: {
  docs: TransparencyDoc[];
  loadingData: boolean;
  onUpload: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            Transparency Files
          </h1>
          <p className="text-gray-500 mt-1">
            Upload and manage transparency documents
          </p>
        </div>
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#B91C1C]" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No documents uploaded yet
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              Uploaded Documents
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#B91C1C]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doc.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()} •{" "}
                      {doc.file_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    <Eye className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactsTab({
  contacts,
  loadingData,
  onView,
}: {
  contacts: Contact[];
  loadingData: boolean;
  onView: (contact: Contact) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            Contacts & Inquiries
          </h1>
          <p className="text-gray-500 mt-1">
            Manage contact form submissions and inquiries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-[#B91C1C]" />
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {contacts.filter((c) => c.type === "general inquiry").length} New
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {contacts.filter((c) => c.type === "general inquiry").length}
          </h3>
          <p className="text-gray-500 text-sm">General Inquiries</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-[#15803d]" />
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {contacts.filter((c) => c.type === "volunteering").length} New
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {contacts.filter((c) => c.type === "volunteering").length}
          </h3>
          <p className="text-gray-500 text-sm">Volunteer Applications</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-8 h-8 text-[#7c3aed]" />
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              {contacts.filter((c) => c.type === "internship").length} New
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {contacts.filter((c) => c.type === "internship").length}
          </h3>
          <p className="text-gray-500 text-sm">Internship Requests</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
            Recent Messages
          </h2>
        </div>
        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#B91C1C]" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No contacts found
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {contacts.map((msg) => (
              <div
                key={msg.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() => onView(msg)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#15803d] flex items-center justify-center text-white font-bold">
                    {msg.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {msg.name}
                      <span className="w-2 h-2 bg-[#B91C1C] rounded-full"></span>
                    </p>
                    <p className="text-sm text-gray-500">{msg.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{msg.type}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab({
  admin,
}: {
  admin: { email: string; role: string } | null;
}) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await apiClient.put("/v1/admin/password/me", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast("success", "Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-6">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#15803d] flex items-center justify-center text-white text-2xl font-bold">
                {admin?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {admin?.email || "Admin User"}
                </p>
                <p className="text-sm text-gray-500">{admin?.role}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {admin?.email || "Not available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {admin?.role || "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-6">
            Change Password
          </h2>
          <div className="space-y-4">
            <FormInput
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(v: string) =>
                setPasswordForm({ ...passwordForm, currentPassword: v })
              }
              placeholder="Enter current password"
              required
            />
            <FormInput
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(v: string) =>
                setPasswordForm({ ...passwordForm, newPassword: v })
              }
              placeholder="Enter new password"
              required
            />
            <FormInput
              label="Confirm Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(v: string) =>
                setPasswordForm({ ...passwordForm, confirmPassword: v })
              }
              placeholder="Confirm new password"
              required
            />
            <button
              onClick={handlePasswordSave}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminsTab({
  admins,
  loadingData,
  onAdd,
  columns,
  onRowClick,
}: {
  admins: Admin[];
  loadingData: boolean;
  onAdd: () => void;
  columns: Column<Admin>[];
  onRowClick: (item: Admin) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            Admin Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage admin accounts (Super Admin only)
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Admin
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        <AdminTable
          data={admins}
          columns={columns}
          loading={loadingData}
          emptyMessage="No admins found"
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  textarea,
}: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-[#B91C1C]">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
        />
      )}
    </div>
  );
}

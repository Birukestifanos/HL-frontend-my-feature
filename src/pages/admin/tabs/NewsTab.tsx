import {
  FileText,
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { News, Emergency } from "../../../types/admin";

interface NewsTabProps {
  news: News[];
  emergencies: Emergency[];
  loadingData: boolean;
  onAddNews: () => void;
  onEditNews: (item: News) => void;
  onDeleteNews: (id: number) => void;
  onAddEmergency: () => void;
  onEditEmergency: (item: Emergency) => void;
  onDeleteEmergency: (id: number) => void;
}

export function NewsTab({
  news,
  emergencies,
  loadingData,
  onAddNews,
  onEditNews,
  onDeleteNews,
  onAddEmergency,
  onEditEmergency,
  onDeleteEmergency,
}: NewsTabProps) {
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

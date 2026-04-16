import { createContext, useContext, useState, useCallback } from "react";
import newsAPI, { type News, type NewsData } from "../services/api/newsApi";

interface NewsContextType {
  news: News[];
  loading: boolean;
  error: string | null;
  // Public
  fetchNews: () => Promise<void>;
  fetchNewsById: (id: number) => Promise<News>;
  // Admin
  createNews: (data: NewsData) => Promise<void>;
  updateNews: (id: number, data: Partial<NewsData>) => Promise<void>;
  deleteNews: (id: number) => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await newsAPI.getAll();
      setNews(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNewsById = useCallback(async (id: number) => {
    const res = await newsAPI.getById(id);
    return res.data;
  }, []);

  const createNews = useCallback(
    async (data: NewsData) => {
      await newsAPI.create(data);
      await fetchNews(); // refetch list
    },
    [fetchNews],
  );

  const updateNews = useCallback(
    async (id: number, data: Partial<NewsData>) => {
      await newsAPI.update(id, data);
      await fetchNews();
    },
    [fetchNews],
  );

  const deleteNews = useCallback(
    async (id: number) => {
      await newsAPI.delete(id);
      await fetchNews();
    },
    [fetchNews],
  );

  return (
    <NewsContext.Provider
      value={{
        news,
        loading,
        error,
        fetchNews,
        fetchNewsById,
        createNews,
        updateNews,
        deleteNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error("useNews must be used within NewsProvider");
  return ctx;
}

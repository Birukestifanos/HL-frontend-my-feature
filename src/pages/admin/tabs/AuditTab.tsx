import { DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react";
import type { Donation, DonationStats } from "../types/admin";

interface AuditTabProps {
  donations: Donation[];
  donationStats: DonationStats | null;
}

export function AuditTab({ donations, donationStats }: AuditTabProps) {
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

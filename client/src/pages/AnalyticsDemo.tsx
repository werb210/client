import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, DollarSign, Users, FileText, Calendar, Download } from "lucide-react";

interface AnalyticsSummary {
  from: string;
  to: string;
  rows: any[];
  totals: {
    leads_new: number;
    apps_created: number;
    apps_funded: number;
    funded_amount: number;
    messages_in: number;
    messages_out: number;
    esign_sent: number;
    esign_completed: number;
    kyc_approved: number;
    slas_breached: number;
  };
}

export default function AnalyticsDemo() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("2025-08-10");
  const [toDate, setToDate] = useState("2025-08-14");

  const fetchAnalytics = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      
      const response = await fetch(`/api/analytics/summary?${params.toString()}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetch30Day = () => fetchAnalytics();
  const fetch7Day = () => {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(new Date(to).getTime() - 6*24*3600*1000).toISOString().slice(0, 10);
    fetchAnalytics(from, to);
  };
  
  const fetchCustomRange = () => fetchAnalytics(fromDate, toDate);

  const exportReport = async () => {
    try {
      const response = await fetch('/api/analytics/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromDate, to: toDate })
      });
      const result = await response.json();
      console.log("Export result:", result);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics(); // Load initial data
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analytics Dashboard Demo
          </h1>
          <p className="text-gray-600">
            Comprehensive KPI tracking and business analytics system
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-teal-600" />
              Analytics Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button onClick={fetch7Day} variant="outline">
                Last 7 Days
              </Button>
              <Button onClick={fetch30Day} variant="outline">
                Last 30 Days
              </Button>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="from-date">From:</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-40"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="to-date">To:</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-40"
                />
              </div>
              
              <Button onClick={fetchCustomRange} className="bg-teal-600 hover:bg-teal-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Get Analytics
              </Button>
              
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">New Leads</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.totals.leads_new}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.totals.apps_created}</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Funded Apps</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.totals.apps_funded}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Funded Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${Number(summary.totals.funded_amount).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Messages In:</span>
                      <span className="font-medium">{summary.totals.messages_in}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Messages Out:</span>
                      <span className="font-medium">{summary.totals.messages_out}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">E-sign Sent:</span>
                      <span className="font-medium">{summary.totals.esign_sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">E-sign Completed:</span>
                      <span className="font-medium">{summary.totals.esign_completed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Process Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">KYC Approved:</span>
                      <span className="font-medium">{summary.totals.kyc_approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SLA Breaches:</span>
                      <span className="font-medium">{summary.totals.slas_breached}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <span className="font-medium">
                        {summary.totals.apps_created > 0 
                          ? `${((summary.totals.apps_funded / summary.totals.apps_created) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Breakdown ({summary.from} to {summary.to})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Leads</th>
                        <th className="p-2 text-left">Apps</th>
                        <th className="p-2 text-left">Funded</th>
                        <th className="p-2 text-left">Amount</th>
                        <th className="p-2 text-left">Messages</th>
                        <th className="p-2 text-left">E-sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.rows.map((row, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="p-2">{row.day}</td>
                          <td className="p-2">{row.leads_new}</td>
                          <td className="p-2">{row.apps_created}</td>
                          <td className="p-2">{row.apps_funded}</td>
                          <td className="p-2">${Number(row.funded_amount || 0).toLocaleString()}</td>
                          <td className="p-2">{row.messages_in}/{row.messages_out}</td>
                          <td className="p-2">{row.esign_sent}/{row.esign_completed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        )}

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Available Endpoints:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• GET /api/analytics/summary</li>
                  <li>• GET /api/analytics/rolling/30d</li>
                  <li>• GET /api/analytics/rolling/7d</li>
                  <li>• POST /api/analytics/backfill</li>
                  <li>• POST /api/analytics/export/pdf</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Tracked Metrics:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• New leads and applications</li>
                  <li>• Funding approvals and amounts</li>
                  <li>• Communication volumes</li>
                  <li>• E-signature completions</li>
                  <li>• KYC approvals and SLA tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
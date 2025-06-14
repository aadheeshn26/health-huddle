
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Mail, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctorEmail, setDoctorEmail] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const generateReport = async () => {
    if (!doctorEmail || !user) {
      toast({
        title: "Missing Information",
        description: "Please enter a doctor's email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create report record
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          doctor_email: doctorEmail,
          time_range: parseInt(timeRange),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Generate report via edge function
      const response = await supabase.functions.invoke('generate-report', {
        body: {
          userId: user.id,
          doctorEmail,
          timeRange: parseInt(timeRange),
          reportId: report.id
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Report Generated",
        description: `Health report sent to ${doctorEmail} successfully.`,
      });

      setDoctorEmail('');
      loadReports();

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'failed':
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-yellow-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400">Please log in to access reports.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="w-full px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">
            DoctorSync Reports
          </h1>
          <p className="text-gray-400">
            Generate and share health reports with your healthcare providers
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Generate New Report */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="text-blue-400 mr-2" size={20} />
              Generate New Report
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Doctor's Email Address
                </label>
                <Input
                  type="email"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time Range
                </label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Mail className="mr-2" size={16} />
                {loading ? 'Generating Report...' : 'Generate & Send Report'}
              </Button>
            </div>
          </Card>

          {/* Report History */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Report History</h3>
            
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No reports generated yet. Create your first report above.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(report.status)}
                      <div>
                        <div className="font-medium text-white">
                          {report.doctor_email}
                        </div>
                        <div className="text-sm text-gray-400">
                          {report.time_range} days • {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      
                      {report.report_url && report.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => window.open(report.report_url, '_blank')}
                        >
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Features Info */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Report Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Includes:</h4>
                <ul className="space-y-1">
                  <li>• Symptom pattern analysis</li>
                  <li>• Extracted image data (glucose, BP)</li>
                  <li>• Voice transcript summaries</li>
                  <li>• Trend visualizations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">AI-Powered:</h4>
                <ul className="space-y-1">
                  <li>• Claude pattern recognition</li>
                  <li>• Google Vision image analysis</li>
                  <li>• GPT-4 professional formatting</li>
                  <li>• Secure email delivery</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Reports;

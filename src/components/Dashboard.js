import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  FileText, 
  BookOpen, 
  AlertTriangle, 
  Users, 
  Activity, 
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react';
import { mockStats, mockDocuments, mockActivityLogs } from '../data/mockData';

const Dashboard = () => {
  const { user } = useAuth();

  const StatCard = ({ title, value, icon: Icon, description, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Borrowed': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recentDocuments = mockDocuments.slice(0, 5);
  const recentActivity = mockActivityLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#5d87ff] to-[#4c75e8] text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100">
          {user?.role === 'Admin' 
            ? 'Manage your archive system and monitor all activities.' 
            : 'Access and manage documents in the smart filing system.'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={mockStats.totalDocuments}
          icon={FileText}
          description="Documents in system"
          trend="+12% from last month"
        />
        <StatCard
          title="Available"
          value={mockStats.availableDocuments}
          icon={BookOpen}
          description="Ready for access"
        />
        <StatCard
          title="Borrowed"
          value={mockStats.borrowedDocuments}
          icon={Clock}
          description="Currently checked out"
        />
        <StatCard
          title="Overdue"
          value={mockStats.overdueDocuments}
          icon={AlertTriangle}
          description="Require attention"
        />
      </div>

      {/* Admin specific stats */}
      {user?.role === 'Admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Active Users"
            value={mockStats.activeUsers}
            icon={Users}
            description={`of ${mockStats.totalUsers} total users`}
          />
          <StatCard
            title="Security Alerts"
            value={mockStats.securityAlerts}
            icon={Shield}
            description="Require review"
          />
          <StatCard
            title="System Health"
            value={`${mockStats.systemHealth}%`}
            icon={Activity}
            description="All systems operational"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Latest registered documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{doc.title}</h4>
                    <p className="text-xs text-gray-600">{doc.physicalLocation}</p>
                    <p className="text-xs text-gray-500">Year: {doc.year}</p>
                  </div>
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`p-1 rounded-full ${
                    activity.status === 'Success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Activity className={`h-3 w-3 ${
                      activity.status === 'Success' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.document}</p>
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                    <p className="text-xs text-gray-400">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Capacity</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>IoT Sensors</span>
                <span>96%</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Network Status</span>
                <span>99%</span>
              </div>
              <Progress value={99} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
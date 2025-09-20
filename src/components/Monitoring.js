import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Clock,
  User,
  FileText,
  Wifi,
  Database,
  Server,
  Lock,
  Unlock,
  XCircle
} from 'lucide-react';
import { mockActivityLogs, mockNotifications, mockStats } from '../data/mockData';

const Monitoring = () => {
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    iotSensors: 96,
    networkStatus: 99,
    databaseHealth: 98,
    securityLevel: 100
  });

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const alertTypes = [
        { type: 'warning', message: 'Unusual access pattern detected at Rack B', icon: AlertTriangle },
        { type: 'info', message: 'Scheduled maintenance completed successfully', icon: CheckCircle },
        { type: 'error', message: 'Sensor communication timeout at Drawer 2', icon: XCircle },
        { type: 'success', message: 'Backup completed successfully', icon: Database }
      ];
      
      if (Math.random() > 0.7) { // 30% chance of new alert
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
          id: Date.now(),
          ...alert,
          timestamp: new Date().toLocaleTimeString(),
          read: false
        };
        
        setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Success') return 'text-green-600';
    if (status === 'Denied') return 'text-red-600';
    return 'text-gray-600';
  };

  const simulateTamperingAlert = () => {
    const tamperAlert = {
      id: Date.now(),
      type: 'error',
      message: 'SECURITY ALERT: Unauthorized tampering detected at Rack A - Drawer 1',
      icon: Shield,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setRealTimeAlerts(prev => [tamperAlert, ...prev.slice(0, 9)]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring and security dashboard</p>
        </div>
        <Button onClick={simulateTamperingAlert} variant="outline" className="text-red-600 border-red-200">
          <Shield className="h-4 w-4 mr-2" />
          Simulate Tampering Alert
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="security">Security Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Real-time Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IoT Sensors</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStatus.iotSensors}%</div>
                <p className="text-xs text-muted-foreground">24/25 sensors online</p>
                <Progress value={systemStatus.iotSensors} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStatus.networkStatus}%</div>
                <p className="text-xs text-muted-foreground">All connections stable</p>
                <Progress value={systemStatus.networkStatus} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Health</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStatus.databaseHealth}%</div>
                <p className="text-xs text-muted-foreground">Optimal performance</p>
                <Progress value={systemStatus.databaseHealth} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Level</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStatus.securityLevel}%</div>
                <p className="text-xs text-muted-foreground">All systems secure</p>
                <Progress value={systemStatus.securityLevel} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Live Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Live System Statistics</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-lg font-bold text-[#5d87ff]">{mockStats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Documents Accessed Today</span>
                  <span className="text-lg font-bold text-[#5d87ff]">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Security Scans Completed</span>
                  <span className="text-lg font-bold text-[#5d87ff]">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Uptime</span>
                  <span className="text-lg font-bold text-green-600">99.8%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IoT Device Status</CardTitle>
                <CardDescription>Smart drawer and sensor monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Rack A - Drawer 1', 'Rack A - Drawer 2', 'Rack B - Drawer 1', 'Rack C - Drawer 1'].map((location, index) => (
                  <div key={location} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${index === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span className="text-sm font-medium">{location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {index === 1 ? 'Maintenance' : 'Online'}
                      </Badge>
                      {index !== 1 && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
              <CardDescription>Detailed log of all system activities and user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className={`p-1 rounded-full ${log.status === 'Success' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Activity className={`h-3 w-3 ${getStatusColor(log.status)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{log.action}</span>
                        <Badge className={log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{log.document}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{log.user}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{log.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Events</span>
                </CardTitle>
                <CardDescription>Recent security-related activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockNotifications.filter(n => n.type === 'alert').map((notification) => (
                  <Alert key={notification.id} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm mt-1">{notification.message}</div>
                      <div className="text-xs mt-2 text-red-600">{notification.timestamp}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control Status</CardTitle>
                <CardDescription>Biometric and security system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Fingerprint Scanner</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Face Recognition</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Tamper Detection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Monitoring</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Unlock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Emergency Override</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Standby</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Real-time System Alerts</span>
              </CardTitle>
              <CardDescription>Live feed of system events and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realTimeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Normal</h3>
                    <p className="text-gray-600">No alerts at this time. System is operating normally.</p>
                  </div>
                ) : (
                  realTimeAlerts.map((alert) => (
                    <Alert key={alert.id} className={getAlertColor(alert.type)}>
                      <alert.icon className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-xs mt-1 opacity-75">{alert.timestamp}</div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs h-6">
                            Acknowledge
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Monitoring;
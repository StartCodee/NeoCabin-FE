// Mock data for Smart Filing System

export const mockUsers = [
  { id: 1, username: 'archivist1', password: 'password', role: 'Archivist', name: 'John Smith' },
  { id: 2, username: 'admin1', password: 'admin123', role: 'Admin', name: 'Sarah Johnson' },
  { id: 3, username: 'archivist2', password: 'password', role: 'Archivist', name: 'Mike Wilson' }
];

export const mockDocuments = [
  {
    id: 1,
    title: 'Annual Financial Report 2023',
    year: 2023,
    physicalLocation: 'Rack A - Drawer 3',
    softFile: 'financial_report_2023.pdf',
    ownership: 'Finance Department',
    accessRights: ['Finance Team', 'Management', 'Auditors'],
    status: 'Available',
    registrationDate: '2023-12-15',
    lastAccessed: '2024-01-10',
    borrowedBy: null,
    borrowDate: null,
    returnDate: null
  },
  {
    id: 2,
    title: 'Employee Handbook v2.1',
    year: 2024,
    physicalLocation: 'Rack B - Drawer 1',
    softFile: 'employee_handbook_v2.1.pdf',
    ownership: 'HR Department',
    accessRights: ['HR Team', 'Management', 'All Employees'],
    status: 'Borrowed',
    registrationDate: '2024-01-05',
    lastAccessed: '2024-02-20',
    borrowedBy: 'Mike Wilson',
    borrowDate: '2024-02-20',
    returnDate: '2024-03-05'
  },
  {
    id: 3,
    title: 'Project Alpha Specifications',
    year: 2024,
    physicalLocation: 'Rack C - Drawer 2',
    softFile: 'project_alpha_specs.pdf',
    ownership: 'Engineering Department',
    accessRights: ['Engineering Team', 'Project Managers'],
    status: 'Available',
    registrationDate: '2024-02-01',
    lastAccessed: '2024-02-15',
    borrowedBy: null,
    borrowDate: null,
    returnDate: null
  },
  {
    id: 4,
    title: 'Legal Contract Template',
    year: 2023,
    physicalLocation: 'Rack A - Drawer 1',
    softFile: 'legal_contract_template.pdf',
    ownership: 'Legal Department',
    accessRights: ['Legal Team', 'Management'],
    status: 'Overdue',
    registrationDate: '2023-11-10',
    lastAccessed: '2024-01-25',
    borrowedBy: 'John Smith',
    borrowDate: '2024-01-25',
    returnDate: '2024-02-10'
  }
];

export const mockLocations = [
  'Rack A - Drawer 1',
  'Rack A - Drawer 2',
  'Rack A - Drawer 3',
  'Rack B - Drawer 1',
  'Rack B - Drawer 2',
  'Rack B - Drawer 3',
  'Rack C - Drawer 1',
  'Rack C - Drawer 2',
  'Rack C - Drawer 3'
];

export const mockDepartments = [
  'Finance Department',
  'HR Department',
  'Engineering Department',
  'Legal Department',
  'Marketing Department',
  'Operations Department'
];

export const mockAccessRights = [
  'Finance Team',
  'HR Team',
  'Engineering Team',
  'Legal Team',
  'Marketing Team',
  'Operations Team',
  'Management',
  'Auditors',
  'All Employees',
  'Project Managers'
];

export const mockActivityLogs = [
  {
    id: 1,
    timestamp: '2024-02-25 10:30:00',
    action: 'Document Retrieved',
    document: 'Annual Financial Report 2023',
    user: 'John Smith',
    location: 'Rack A - Drawer 3',
    status: 'Success'
  },
  {
    id: 2,
    timestamp: '2024-02-25 09:15:00',
    action: 'Document Returned',
    document: 'Employee Handbook v2.1',
    user: 'Mike Wilson',
    location: 'Rack B - Drawer 1',
    status: 'Success'
  },
  {
    id: 3,
    timestamp: '2024-02-24 16:45:00',
    action: 'Unauthorized Access Attempt',
    document: 'Legal Contract Template',
    user: 'Unknown',
    location: 'Rack A - Drawer 1',
    status: 'Denied'
  },
  {
    id: 4,
    timestamp: '2024-02-24 14:20:00',
    action: 'Document Borrowed',
    document: 'Project Alpha Specifications',
    user: 'Sarah Johnson',
    location: 'Rack C - Drawer 2',
    status: 'Success'
  }
];

export const mockNotifications = [
  {
    id: 1,
    type: 'warning',
    title: 'Overdue Document',
    message: 'Legal Contract Template is 15 days overdue',
    timestamp: '2024-02-25 08:00:00',
    read: false
  },
  {
    id: 2,
    type: 'alert',
    title: 'Security Alert',
    message: 'Unauthorized access attempt detected at Rack A - Drawer 1',
    timestamp: '2024-02-24 16:45:00',
    read: false
  },
  {
    id: 3,
    type: 'info',
    title: 'Document Returned',
    message: 'Employee Handbook v2.1 has been returned successfully',
    timestamp: '2024-02-25 09:15:00',
    read: true
  }
];

export const mockStats = {
  totalDocuments: 156,
  availableDocuments: 134,
  borrowedDocuments: 19,
  overdueDocuments: 3,
  totalUsers: 45,
  activeUsers: 28,
  securityAlerts: 2,
  systemHealth: 98
};
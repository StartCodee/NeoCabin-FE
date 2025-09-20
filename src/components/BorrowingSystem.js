import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  Plus,
  FileText
} from 'lucide-react';
import { mockDocuments, mockUsers } from '../data/mockData';

const BorrowingSystem = () => {
  const { toast } = useToast();
  const [borrowForm, setBorrowForm] = useState({
    documentId: '',
    borrower: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });

  const availableDocuments = mockDocuments.filter(doc => doc.status === 'Available');
  const borrowedDocuments = mockDocuments.filter(doc => doc.status === 'Borrowed' || doc.status === 'Overdue');
  const overdueDocuments = mockDocuments.filter(doc => doc.status === 'Overdue');

  const handleBorrowSubmit = (e) => {
    e.preventDefault();
    
    // Simulate borrow process
    toast({
      title: "Document Borrowed Successfully",
      description: `Document has been checked out to ${borrowForm.borrower}.`
    });

    // Reset form
    setBorrowForm({
      documentId: '',
      borrower: '',
      startDate: '',
      endDate: '',
      purpose: ''
    });
  };

  const handleReturn = (documentId) => {
    toast({
      title: "Document Returned",
      description: "Document has been successfully returned to the archive."
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Borrowed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysUntilDue = (returnDate) => {
    const today = new Date();
    const due = new Date(returnDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Borrowing System</h1>
        <p className="text-gray-600">Manage document borrowing and returns</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="borrow">Borrow Document</TabsTrigger>
          <TabsTrigger value="borrowed">Borrowed Documents</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{borrowedDocuments.length}</div>
                <p className="text-xs text-muted-foreground">Currently checked out</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableDocuments.length}</div>
                <p className="text-xs text-muted-foreground">Ready for borrowing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueDocuments.length}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Borrowing Activity</CardTitle>
              <CardDescription>Latest document borrowing and returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {borrowedDocuments.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-600">Borrowed by {doc.borrowedBy}</p>
                        <p className="text-xs text-gray-500">Due: {doc.returnDate}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Borrow Document</span>
              </CardTitle>
              <CardDescription>Check out a document from the archive</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBorrowSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="document">Document *</Label>
                    <Select 
                      value={borrowForm.documentId} 
                      onValueChange={(value) => setBorrowForm(prev => ({...prev, documentId: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDocuments.map(doc => (
                          <SelectItem key={doc.id} value={doc.id.toString()}>
                            {doc.title} - {doc.physicalLocation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borrower">Borrower *</Label>
                    <Select 
                      value={borrowForm.borrower} 
                      onValueChange={(value) => setBorrowForm(prev => ({...prev, borrower: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select borrower" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.map(user => (
                          <SelectItem key={user.id} value={user.name}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={borrowForm.startDate}
                      onChange={(e) => setBorrowForm(prev => ({...prev, startDate: e.target.value}))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Return Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={borrowForm.endDate}
                      onChange={(e) => setBorrowForm(prev => ({...prev, endDate: e.target.value}))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose (Optional)</Label>
                  <Input
                    id="purpose"
                    placeholder="Reason for borrowing..."
                    value={borrowForm.purpose}
                    onChange={(e) => setBorrowForm(prev => ({...prev, purpose: e.target.value}))}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-[#5d87ff] hover:bg-[#4c75e8]"
                  disabled={!borrowForm.documentId || !borrowForm.borrower || !borrowForm.startDate || !borrowForm.endDate}
                >
                  Borrow Document
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed Documents</CardTitle>
              <CardDescription>Documents that are currently checked out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {borrowedDocuments.map((doc) => {
                  const daysUntilDue = getDaysUntilDue(doc.returnDate);
                  return (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{doc.title}</h3>
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Borrowed by: <strong>{doc.borrowedBy}</strong></span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Borrowed: {doc.borrowDate}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span className={daysUntilDue < 0 ? 'text-red-600 font-medium' : daysUntilDue <= 3 ? 'text-yellow-600 font-medium' : ''}>
                                Due: {doc.returnDate}
                                {daysUntilDue < 0 ? ` (${Math.abs(daysUntilDue)} days overdue)` : 
                                 daysUntilDue <= 3 ? ` (${daysUntilDue} days left)` : ''}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600">Location: {doc.physicalLocation}</p>
                        </div>

                        <Button
                          onClick={() => handleReturn(doc.id)}
                          variant="outline"
                          className="ml-4"
                        >
                          Mark as Returned
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {borrowedDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowed documents</h3>
                    <p className="text-gray-600">All documents are currently available in the archive.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Overdue Documents</span>
              </CardTitle>
              <CardDescription>Documents that are past their return date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueDocuments.map((doc) => {
                  const daysOverdue = Math.abs(getDaysUntilDue(doc.returnDate));
                  return (
                    <div key={doc.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-red-900">{doc.title}</h3>
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              {daysOverdue} days overdue
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-red-700 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Borrowed by: <strong>{doc.borrowedBy}</strong></span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Borrowed: {doc.borrowDate}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Was due: {doc.returnDate}</span>
                            </div>
                          </div>

                          <p className="text-sm text-red-600">Location: {doc.physicalLocation}</p>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            onClick={() => handleReturn(doc.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            Force Return
                          </Button>
                          <Button variant="outline" size="sm">
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {overdueDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No overdue documents</h3>
                    <p className="text-gray-600">All borrowed documents are within their return periods.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BorrowingSystem;
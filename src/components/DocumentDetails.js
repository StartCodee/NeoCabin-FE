import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';
import { 
  ArrowLeft, 
  Download, 
  Unlock, 
  Lock, 
  Calendar,
  MapPin,
  User,
  Shield,
  FileText,
  Fingerprint,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { mockDocuments } from '../data/mockData';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricStep, setBiometricStep] = useState('scanning'); // scanning, success, denied
  const [ledStatus, setLedStatus] = useState('ready'); // ready, green, red, yellow
  const [isProcessing, setIsProcessing] = useState(false);

  const document = mockDocuments.find(doc => doc.id === parseInt(id));

  if (!document) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Document not found</h3>
        <Button onClick={() => navigate('/search')} variant="outline">
          Back to Search
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Borrowed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLedColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-gray-400';
      case 'green': return 'bg-green-500 animate-pulse';
      case 'red': return 'bg-red-500 animate-pulse';
      case 'yellow': return 'bg-yellow-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  const handleRetrieveDocument = () => {
    setShowBiometric(true);
    setBiometricStep('scanning');
    setLedStatus('ready');
    
    // Simulate biometric scanning
    setTimeout(() => {
      const isAuthorized = Math.random() > 0.2; // 80% success rate
      if (isAuthorized) {
        setBiometricStep('success');
        setLedStatus('green');
        toast({
          title: "Access Granted",
          description: "Document retrieval authorized. Drawer is opening..."
        });
        
        // Simulate drawer opening sequence
        setTimeout(() => {
          setLedStatus('red'); // Document taken
          setShowBiometric(false);
          toast({
            title: "Document Retrieved",
            description: "Please take the document from the drawer."
          });
        }, 3000);
      } else {
        setBiometricStep('denied');
        setLedStatus('ready');
        toast({
          title: "Access Denied",
          description: "Biometric verification failed. Please try again.",
          variant: "destructive"
        });
        setTimeout(() => {
          setShowBiometric(false);
        }, 2000);
      }
    }, 2000);
  };

  const handleReturnDocument = () => {
    setIsProcessing(true);
    setShowBiometric(true);
    setBiometricStep('scanning');
    setLedStatus('red');
    
    // Simulate return process
    setTimeout(() => {
      setBiometricStep('success');
      setLedStatus('yellow'); // Document returned
      toast({
        title: "Document Returned",
        description: "Document has been successfully returned to the archive."
      });
      
      setTimeout(() => {
        setLedStatus('ready');
        setShowBiometric(false);
        setIsProcessing(false);
      }, 2000);
    }, 2000);
  };

  const BiometricModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Fingerprint className="h-6 w-6 text-[#5d87ff]" />
            <span>Biometric Verification</span>
          </CardTitle>
          <CardDescription>Verifying your identity for document access</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {biometricStep === 'scanning' && (
            <>
              <div className="bg-[#5d87ff] bg-opacity-10 p-6 rounded-full mx-auto w-fit animate-pulse">
                <Fingerprint className="h-12 w-12 text-[#5d87ff]" />
              </div>
              <p className="text-sm text-gray-600">Place your finger on the scanner...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#5d87ff] h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </>
          )}

          {biometricStep === 'success' && (
            <>
              <div className="bg-green-100 p-6 rounded-full mx-auto w-fit">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-sm text-green-600 font-medium">Verification Successful!</p>
              <p className="text-xs text-gray-600">Processing request...</p>
            </>
          )}

          {biometricStep === 'denied' && (
            <>
              <div className="bg-red-100 p-6 rounded-full mx-auto w-fit">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-sm text-red-600 font-medium">Access Denied</p>
              <p className="text-xs text-gray-600">Biometric verification failed</p>
            </>
          )}

          {/* LED Status Indicator */}
          <div className="flex items-center justify-center space-x-2 pt-4 border-t">
            <span className="text-sm text-gray-600">LED Status:</span>
            <div className={`w-3 h-3 rounded-full ${getLedColor(ledStatus)}`}></div>
            <span className="text-sm capitalize text-gray-600">{ledStatus === 'ready' ? 'Ready' : ledStatus}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {showBiometric && <BiometricModal />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/search')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Details</h1>
            <p className="text-gray-600">View and manage document information</p>
          </div>
        </div>
        <Badge className={getStatusColor(document.status)}>
          {document.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{document.title}</span>
              </CardTitle>
              <CardDescription>Document metadata and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Year</p>
                      <p className="text-lg">{document.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Physical Location</p>
                      <p className="text-lg">{document.physicalLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Ownership</p>
                      <p className="text-lg">{document.ownership}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Registration Date</p>
                    <p>{document.registrationDate}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Last Accessed</p>
                    <p>{document.lastAccessed}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Soft File</p>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{document.softFile}</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium">Access Rights</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {document.accessRights.map(right => (
                    <Badge key={right} variant="outline">{right}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrowing Information */}
          {document.status !== 'Available' && (
            <Card>
              <CardHeader>
                <CardTitle>Borrowing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Borrowed By</p>
                    <p className="text-lg">{document.borrowedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Borrow Date</p>
                    <p>{document.borrowDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expected Return Date</p>
                    <p className={document.status === 'Overdue' ? 'text-red-600 font-medium' : ''}>
                      {document.returnDate}
                    </p>
                  </div>
                  {document.status === 'Overdue' && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        This document is overdue and requires immediate return.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Actions</CardTitle>
              <CardDescription>Retrieve or return document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.status === 'Available' ? (
                <Button 
                  onClick={handleRetrieveDocument}
                  className="w-full bg-[#5d87ff] hover:bg-[#4c75e8]"
                  disabled={isProcessing}
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Retrieve Document
                </Button>
              ) : (
                <Button 
                  onClick={handleReturnDocument}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return Document
                </Button>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-500 mb-2">IoT Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getLedColor(ledStatus)}`}></div>
                  <span className="text-sm capitalize">{ledStatus === 'ready' ? 'Ready' : ledStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Fingerprint Required</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Face Recognition</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tamper Detection</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Location Tracking</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
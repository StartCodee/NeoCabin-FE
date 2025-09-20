import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Calendar,
  MapPin,
  User,
  Shield
} from 'lucide-react';
import { mockLocations, mockDepartments, mockAccessRights } from '../data/mockData';

const DocumentRegistration = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    physicalLocation: '',
    softFile: null,
    ownership: '',
    accessRights: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAccessRightsChange = (right, checked) => {
    setFormData(prev => ({
      ...prev,
      accessRights: checked
        ? [...prev.accessRights, right]
        : prev.accessRights.filter(r => r !== right)
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        softFile: file
      }));
      toast({
        title: "File uploaded",
        description: `${file.name} has been selected for upload.`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setShowPreview(true);
    setIsSubmitting(false);

    toast({
      title: "Document registered successfully!",
      description: "The document has been added to the archive system."
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      year: new Date().getFullYear(),
      physicalLocation: '',
      softFile: null,
      ownership: '',
      accessRights: []
    });
    setShowPreview(false);
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Document Registered Successfully</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
            <CardDescription>Review the registered document details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Document Title</Label>
                  <p className="text-lg font-semibold">{formData.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Year</Label>
                  <p className="text-lg">{formData.year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Physical Location</Label>
                  <p className="text-lg">{formData.physicalLocation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ownership</Label>
                  <p className="text-lg">{formData.ownership}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Uploaded File</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span>{formData.softFile?.name || 'No file uploaded'}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Access Rights</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.accessRights.map(right => (
                      <Badge key={right} variant="outline">{right}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex space-x-4">
                <Button onClick={resetForm} className="bg-[#5d87ff] hover:bg-[#4c75e8]">
                  Register Another Document
                </Button>
                <Button variant="outline">
                  View in Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Registration</h1>
        <p className="text-gray-600">Add a new document to the smart filing system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register New Document</CardTitle>
          <CardDescription>Fill in the document details to add it to the archive</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Document Title *</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter document title"
                  required
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Year *</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  required
                />
              </div>

              {/* Physical Location */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Physical Location *</span>
                </Label>
                <Select value={formData.physicalLocation} onValueChange={(value) => handleInputChange('physicalLocation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLocations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ownership */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Ownership *</span>
                </Label>
                <Select value={formData.ownership} onValueChange={(value) => handleInputChange('ownership', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Soft File</span>
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-[#5d87ff] hover:text-[#4c75e8] font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                  {formData.softFile && (
                    <Alert className="mt-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {formData.softFile.name} ready for upload
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Access Rights */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Access Rights *</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mockAccessRights.map(right => (
                  <div key={right} className="flex items-center space-x-2">
                    <Checkbox
                      id={right}
                      checked={formData.accessRights.includes(right)}
                      onCheckedChange={(checked) => handleAccessRightsChange(right, checked)}
                    />
                    <Label htmlFor={right} className="text-sm font-normal cursor-pointer">
                      {right}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset Form
              </Button>
              <Button 
                type="submit" 
                className="bg-[#5d87ff] hover:bg-[#4c75e8]"
                disabled={isSubmitting || !formData.title || !formData.physicalLocation || !formData.ownership || formData.accessRights.length === 0}
              >
                {isSubmitting ? 'Registering...' : 'Register Document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentRegistration;
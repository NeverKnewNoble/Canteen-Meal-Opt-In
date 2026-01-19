'use client';

import { X, Upload, Download, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from '@/components/alert';
import {
  parseCSV,
  validateUsers,
  bulkCreateUsers,
  downloadCSVTemplate,
  readFileAsText,
  type ParsedUserRow,
  type ValidationResult,
  type ImportResult
} from '@/utils/bulkImport';
import type { Department } from '@/utils/departments';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  departments: Department[];
}

type Step = 'upload' | 'preview' | 'importing' | 'complete';

export default function BulkImportModal({
  isOpen,
  onClose,
  onImportComplete,
  departments
}: BulkImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    setIsProcessing(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate(departments);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const content = await readFileAsText(selectedFile);
      const parsedUsers = parseCSV(content);

      if (parsedUsers.length === 0) {
        toast.error('No valid users found in the CSV file');
        setIsProcessing(false);
        return;
      }

      const validation = validateUsers(parsedUsers, departments);
      setValidationResult(validation);
      setStep('preview');
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult || validationResult.valid.length === 0) {
      toast.error('No valid users to import');
      return;
    }

    setStep('importing');
    setIsProcessing(true);

    try {
      const result = await bulkCreateUsers(validationResult.valid, departments);
      setImportResult(result);
      setStep('complete');

      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} user(s)`);
        onImportComplete();
      }
    } catch (error: any) {
      toast.error('Import failed: ' + (error.message || 'Unknown error'));
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!droppedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    // Create a synthetic event to reuse the file select handler
    const syntheticEvent = {
      target: { files: [droppedFile] }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await handleFileSelect(syntheticEvent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 border-2 border-gray-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-main-text">Bulk Import Users</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-text hover:text-main-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">CSV File Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Must have <strong>Name</strong> and <strong>Department</strong> columns</li>
                      <li>Department must match an existing department in the system</li>
                      <li>Download the template below for the correct format</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Available Departments */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-main-text mb-2">Available Departments:</p>
                <div className="flex flex-wrap gap-2">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <span
                        key={dept.id}
                        className="inline-flex px-3 py-1 text-sm rounded-full bg-white border border-gray-200 text-muted-text"
                      >
                        {dept.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-text">
                      No departments found. Please create departments first.
                    </span>
                  )}
                </div>
              </div>

              {/* Download Template Button */}
              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-main-text rounded-lg hover:bg-gray-200 transition-colors font-medium border-2 border-gray-200"
              >
                <Download className="w-5 h-5" />
                Download CSV Template
              </button>

              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-main-text font-medium mb-1">
                  {isProcessing ? 'Processing...' : 'Drop your CSV file here or click to browse'}
                </p>
                <p className="text-sm text-muted-text">Supports .csv files only</p>
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && validationResult && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      {validationResult.valid.length} Valid
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Ready to import</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      {validationResult.invalid.length} Invalid
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">Will be skipped</p>
                </div>
              </div>

              {/* Valid Users Preview */}
              {validationResult.valid.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-main-text mb-2">
                    Users to Import ({validationResult.valid.length})
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-text uppercase">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-text uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-text uppercase">Department</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {validationResult.valid.map((user) => (
                          <tr key={user.rowNumber}>
                            <td className="px-4 py-2 text-muted-text">{user.rowNumber}</td>
                            <td className="px-4 py-2 text-main-text">{user.name}</td>
                            <td className="px-4 py-2 text-main-text">{user.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invalid Users */}
              {validationResult.invalid.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-2">
                    Invalid Rows ({validationResult.invalid.length})
                  </h3>
                  <div className="border border-red-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto bg-red-50">
                    <table className="w-full text-sm">
                      <thead className="bg-red-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {validationResult.invalid.map(({ row, error }) => (
                          <tr key={row.rowNumber}>
                            <td className="px-4 py-2 text-red-600">{row.rowNumber}</td>
                            <td className="px-4 py-2 text-red-700">{row.name || '(empty)'}</td>
                            <td className="px-4 py-2 text-red-600 text-xs">{error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-main-text font-medium">Importing users...</p>
              <p className="text-sm text-muted-text mt-1">Please wait while we add the users</p>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && importResult && (
            <div className="space-y-6">
              {/* Success Summary */}
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-main-text mb-2">Import Complete</h3>
                <p className="text-muted-text">
                  Successfully imported {importResult.success} user(s)
                  {importResult.failed > 0 && `, ${importResult.failed} failed`}
                </p>
              </div>

              {/* Result Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{importResult.success}</p>
                  <p className="text-sm text-green-600">Imported</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-700">{importResult.failed}</p>
                  <p className="text-sm text-muted-text">Failed</p>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-2">Errors</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-32 overflow-y-auto">
                    <ul className="text-sm text-red-600 space-y-1">
                      {importResult.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {step === 'upload' && (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-main-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setValidationResult(null);
                }}
                className="px-5 py-2.5 text-main-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={validationResult.valid.length === 0 || isProcessing}
                className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Import {validationResult.valid.length} User(s)
              </button>
            </>
          )}

          {step === 'complete' && (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

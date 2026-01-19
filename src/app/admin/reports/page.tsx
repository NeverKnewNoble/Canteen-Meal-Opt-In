'use client';

import { useState, useEffect, useRef } from 'react';
import { Printer, Download, FileSpreadsheet, Calendar, Users, CheckCircle, XCircle, ChevronRight, ArrowLeft, FileText, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getAllMenus, getStatusColor } from '@/utils/menu';
import { getSelectionsByMenuId, SelectionWithDetails } from '@/utils/selections';
import { getMealsByMenuId } from '@/utils/meals';
import { getAllDepartments } from '@/utils/departments';
import type { Menu, MenuMeal } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selections, setSelections] = useState<SelectionWithDetails[]>([]);
  const [meals, setMeals] = useState<MenuMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [departments, setDepartments] = useState<Map<string, string>>(new Map());

  // Fetch menus on mount
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const fetchedMenus = await getAllMenus();
        setMenus(fetchedMenus);
        
        // Also fetch departments for lookup
        const deptList = await getAllDepartments();
        const deptMap = new Map<string, string>();
        deptList.forEach(dept => {
          deptMap.set(dept.id, dept.name);
        });
        setDepartments(deptMap);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  // Helper function to get department name
  const getDepartmentName = (departmentId: string | null | undefined) => {
    if (!departmentId) return 'No Department';
    return departments.get(departmentId) || 'Unknown Department';
  };

  // Print function
  const handlePrint = () => {
    if (!selectedMenu) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Meal Report - ${selectedMenu.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1f2937; margin-bottom: 5px; }
            .subtitle { color: #6b7280; margin-bottom: 20px; }
            .stats { display: flex; gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; min-width: 120px; }
            .stat-label { font-size: 12px; color: #6b7280; }
            .stat-value { font-size: 24px; font-weight: bold; }
            .meal-section { margin-bottom: 30px; }
            .meal-header { background: #f9fafb; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px 8px 0 0; }
            .meal-title { font-size: 16px; font-weight: 600; margin: 0; }
            .meal-desc { font-size: 12px; color: #6b7280; margin: 4px 0 0 0; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f9fafb; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #6b7280; border: 1px solid #e5e7eb; }
            td { padding: 10px; border: 1px solid #e5e7eb; font-size: 13px; }
            .yes { color: #059669; font-weight: 500; }
            .no { color: #6b7280; font-weight: 500; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${selectedMenu.name}</h1>
          <p class="subtitle">Date: ${selectedMenu.date} | Deadline: ${new Date(selectedMenu.deadline).toLocaleDateString()}</p>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-label">Total Submissions</div>
              <div class="stat-value">${selections.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Opted In (Yes)</div>
              <div class="stat-value" style="color: #059669;">${optedInCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Opted Out (No)</div>
              <div class="stat-value" style="color: #6b7280;">${optedOutCount}</div>
            </div>
          </div>

          ${selectionsByMeal.map(({ meal, selections: mealSelections }) => `
            <div class="meal-section">
              <div class="meal-header">
                <p class="meal-title">${meal.name} (${mealSelections.filter(s => s.optedIn).length} Yes, ${mealSelections.filter(s => !s.optedIn).length} No)</p>
                <p class="meal-desc">${meal.description || ''}</p>
              </div>
              ${mealSelections.length > 0 ? `
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Selection</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${mealSelections.map((s, i) => `
                      <tr>
                        <td>${i + 1}</td>
                        <td>${s.userName}</td>
                        <td>${getDepartmentName(s.department)}</td>
                        <td class="${s.optedIn ? 'yes' : 'no'}">${s.optedIn ? 'Yes' : 'No'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<p style="padding: 16px; color: #6b7280;">No selections for this meal</p>'}
            </div>
          `).join('')}

          <div class="footer">
            <p>Canteen Meal Opt-In Management System</p>
            <p>Report generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // PDF download function
  const handleDownloadPDF = () => {
    if (!selectedMenu) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text(selectedMenu.name, 14, 20);

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Date: ${selectedMenu.date} | Deadline: ${new Date(selectedMenu.deadline).toLocaleDateString()}`, 14, 28);

    // Stats
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`Total: ${selections.length}  |  Yes: ${optedInCount}  |  No: ${optedOutCount}`, 14, 38);

    let yPosition = 48;

    // For each meal
    selectionsByMeal.forEach(({ meal, selections: mealSelections }) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Meal header
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text(`${meal.name} (${mealSelections.filter(s => s.optedIn).length} Yes, ${mealSelections.filter(s => !s.optedIn).length} No)`, 14, yPosition);
      yPosition += 6;

      if (meal.description) {
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(meal.description, 14, yPosition);
        yPosition += 6;
      }

      if (mealSelections.length > 0) {
        // Table
        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Employee', 'Department', 'Selection']],
          body: mealSelections.map((s, i) => [
            (i + 1).toString(),
            s.userName,
            getDepartmentName(s.department),
            s.optedIn ? 'Yes' : 'No'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [249, 250, 251], textColor: [107, 114, 128], fontSize: 9 },
          bodyStyles: { fontSize: 9, textColor: [31, 41, 55] },
          columnStyles: {
            0: { cellWidth: 15 },
            3: { cellWidth: 25 }
          },
          margin: { left: 14, right: 14 },
          didParseCell: (data) => {
            if (data.column.index === 3 && data.section === 'body') {
              if (data.cell.raw === 'Yes') {
                data.cell.styles.textColor = [5, 150, 105];
                data.cell.styles.fontStyle = 'bold';
              } else {
                data.cell.styles.textColor = [107, 114, 128];
              }
            }
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text('No selections for this meal', 14, yPosition + 5);
        yPosition += 15;
      }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Canteen Meal Opt-In Management System', 14, doc.internal.pageSize.getHeight() - 15);
      doc.text(`Report generated on ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
    }

    // Download
    doc.save(`${selectedMenu.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  // Excel download function
  const handleDownloadExcel = () => {
    if (!selectedMenu) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // ============ SHEET 1: Full Report (like PDF) ============
    const fullReportData: (string | number)[][] = [
      ['MEAL SUBMISSION REPORT'],
      [''],
      ['Menu Name:', selectedMenu.name],
      ['Date:', selectedMenu.date],
      ['Deadline:', new Date(selectedMenu.deadline).toLocaleDateString()],
      ['Status:', selectedMenu.status.charAt(0).toUpperCase() + selectedMenu.status.slice(1)],
      [''],
      ['SUMMARY'],
      ['Total Submissions:', selections.length],
      ['Opted In (Yes):', optedInCount],
      ['Opted Out (No):', optedOutCount],
      [''],
      [''],
      ['DETAILED BREAKDOWN BY MEAL'],
      ['']
    ];

    // Add each meal section
    selectionsByMeal.forEach(({ meal, selections: mealSelections }) => {
      const yesCount = mealSelections.filter(s => s.optedIn).length;
      const noCount = mealSelections.filter(s => !s.optedIn).length;

      // Meal header
      fullReportData.push(['']);
      fullReportData.push([`MEAL: ${meal.name}`]);
      fullReportData.push([`Description: ${meal.description || 'N/A'}`]);
      fullReportData.push([`Opted In (Yes): ${yesCount}`, '', `Opted Out (No): ${noCount}`, '', `Total: ${mealSelections.length}`]);
      fullReportData.push(['']);

      if (mealSelections.length > 0) {
        // Table header
        fullReportData.push(['#', 'Employee Name', 'Department', 'Selection']);

        // Table rows
        mealSelections.forEach((s, i) => {
          fullReportData.push([
            i + 1,
            s.userName,
            getDepartmentName(s.department),
            s.optedIn ? 'YES' : 'NO'
          ]);
        });
      } else {
        fullReportData.push(['No selections for this meal']);
      }

      fullReportData.push(['']);
      fullReportData.push(['─'.repeat(50)]);
    });

    // Footer
    fullReportData.push(['']);
    fullReportData.push(['']);
    fullReportData.push(['Canteen Meal Opt-In Management System']);
    fullReportData.push([`Report Generated: ${new Date().toLocaleString()}`]);

    const fullReportSheet = XLSX.utils.aoa_to_sheet(fullReportData);
    // Set column widths
    fullReportSheet['!cols'] = [
      { wch: 8 },   // #
      { wch: 30 },  // Employee Name
      { wch: 25 },  // Department
      { wch: 12 },  // Selection
      { wch: 15 }   // Extra
    ];
    XLSX.utils.book_append_sheet(wb, fullReportSheet, 'Full Report');

    // ============ SHEET 2: All Selections Table ============
    const allSelectionsData: (string | number)[][] = [
      ['ALL MEAL SELECTIONS'],
      [''],
      ['#', 'Employee Name', 'Department', 'Meal', 'Selection']
    ];

    let rowNum = 1;
    selections.forEach((s) => {
      allSelectionsData.push([
        rowNum,
        s.userName,
        getDepartmentName(s.department),
        s.mealName,
        s.optedIn ? 'YES' : 'NO'
      ]);
      rowNum++;
    });

    const allSelectionsSheet = XLSX.utils.aoa_to_sheet(allSelectionsData);
    allSelectionsSheet['!cols'] = [
      { wch: 8 },   // #
      { wch: 30 },  // Employee Name
      { wch: 25 },  // Department
      { wch: 30 },  // Meal
      { wch: 12 }   // Selection
    ];
    XLSX.utils.book_append_sheet(wb, allSelectionsSheet, 'All Selections');

    // ============ SHEET 3: Yes Only ============
    const yesOnlyData: (string | number)[][] = [
      ['OPTED IN (YES) - EMPLOYEES WHO WANT THE MEAL'],
      [''],
      ['#', 'Employee Name', 'Department', 'Meal']
    ];

    let yesRowNum = 1;
    selections.filter(s => s.optedIn).forEach((s) => {
      yesOnlyData.push([
        yesRowNum,
        s.userName,
        getDepartmentName(s.department),
        s.mealName
      ]);
      yesRowNum++;
    });

    const yesOnlySheet = XLSX.utils.aoa_to_sheet(yesOnlyData);
    yesOnlySheet['!cols'] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 25 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, yesOnlySheet, 'Opted In (Yes)');

    // ============ SHEET 4: No Only ============
    const noOnlyData: (string | number)[][] = [
      ['OPTED OUT (NO) - EMPLOYEES WHO DECLINED'],
      [''],
      ['#', 'Employee Name', 'Department', 'Meal']
    ];

    let noRowNum = 1;
    selections.filter(s => !s.optedIn).forEach((s) => {
      noOnlyData.push([
        noRowNum,
        s.userName,
        getDepartmentName(s.department),
        s.mealName
      ]);
      noRowNum++;
    });

    const noOnlySheet = XLSX.utils.aoa_to_sheet(noOnlyData);
    noOnlySheet['!cols'] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 25 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, noOnlySheet, 'Opted Out (No)');

    // ============ Individual Meal Sheets ============
    selectionsByMeal.forEach(({ meal, selections: mealSelections }, mealIndex) => {
      const yesCount = mealSelections.filter(s => s.optedIn).length;
      const noCount = mealSelections.filter(s => !s.optedIn).length;

      const mealData: (string | number)[][] = [
        [`MEAL: ${meal.name}`],
        [''],
        ['Description:', meal.description || 'N/A'],
        [''],
        ['SUMMARY'],
        ['Total Selections:', mealSelections.length],
        ['Opted In (Yes):', yesCount],
        ['Opted Out (No):', noCount],
        [''],
        [''],
        ['EMPLOYEE SELECTIONS'],
        ['#', 'Employee Name', 'Department', 'Selection']
      ];

      if (mealSelections.length > 0) {
        mealSelections.forEach((s, i) => {
          mealData.push([
            i + 1,
            s.userName,
            getDepartmentName(s.department),
            s.optedIn ? 'YES' : 'NO'
          ]);
        });
      } else {
        mealData.push(['', 'No selections for this meal', '', '']);
      }

      const mealSheet = XLSX.utils.aoa_to_sheet(mealData);
      mealSheet['!cols'] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 25 },
        { wch: 12 }
      ];

      // Truncate sheet name to 31 chars (Excel limit) and add index to ensure uniqueness
      let sheetName = meal.name.substring(0, 28).replace(/[\\\/\*\?\[\]:]/g, '');
      sheetName = `${mealIndex + 1}. ${sheetName}`;
      XLSX.utils.book_append_sheet(wb, mealSheet, sheetName.substring(0, 31));
    });

    // Download
    XLSX.writeFile(wb, `${selectedMenu.name.replace(/\s+/g, '_')}_Report.xlsx`);
  };

  // Fetch selections when a menu is selected
  const handleSelectMenu = async (menu: Menu) => {
    setLoadingReport(true);
    try {
      const [fetchedSelections, fetchedMeals] = await Promise.all([
        getSelectionsByMenuId(menu.id),
        getMealsByMenuId(menu.id)
      ]);
      setSelections(fetchedSelections);
      setMeals(fetchedMeals);
      setSelectedMenu(menu);
    } catch (error) {
      console.error('Failed to fetch selections:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleBackToMenus = () => {
    setSelectedMenu(null);
    setSelections([]);
    setMeals([]);
  };

  // Calculate stats
  const optedInCount = selections.filter(s => s.optedIn).length;
  const optedOutCount = selections.filter(s => !s.optedIn).length;

  // Group selections by meal
  const selectionsByMeal = meals.map(meal => ({
    meal,
    selections: selections.filter(s => s.mealName === meal.name)
  }));

  // Menu Selection View
  if (!selectedMenu) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar title="Reports & Export" step="Admin Screen 5/5" backHref="/admin" />

        <main className="px-8 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-main-text">Reports & Export</h1>
              <p className="text-muted-text mt-1">Select a menu to generate a report</p>
            </div>

            {/* Menu Selection Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : menus.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-main-text mb-2">No menus available</h3>
                <p className="text-muted-text">Create a menu first to generate reports</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => handleSelectMenu(menu)}
                    className="bg-white rounded-xl border-2 border-gray-200 p-6 text-left hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-main-text group-hover:text-primary transition-colors">
                          {menu.name}
                        </h3>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full mt-2 ${getStatusColor(menu.status)}`}>
                          {menu.status.charAt(0).toUpperCase() + menu.status.slice(1)}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-text group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-2 text-sm text-muted-text">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{menu.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Deadline: {new Date(menu.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Report View for Selected Menu
  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Reports & Export" step="Admin Screen 5/5" backHref="/admin" />

      <main className="px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button & Header */}
          <div className="mb-6">
            <button
              onClick={handleBackToMenus}
              className="flex items-center text-muted-text hover:text-primary transition-colors mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu Selection
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-main-text">{selectedMenu.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-text">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedMenu.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {new Date(selectedMenu.deadline).toLocaleDateString()}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedMenu.status)}`}>
                    {selectedMenu.status.charAt(0).toUpperCase() + selectedMenu.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-main-text mb-4">Export Options</h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handlePrint}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary/30 hover:bg-gray-50 transition-all text-center cursor-pointer"
              >
                <Printer className="w-8 h-8 mx-auto mb-3 text-main-text" />
                <h3 className="font-semibold text-main-text mb-1">Print</h3>
                <p className="text-sm text-muted-text">Direct to printer</p>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary/30 hover:bg-gray-50 transition-all text-center cursor-pointer"
              >
                <Download className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-main-text mb-1">PDF</h3>
                <p className="text-sm text-muted-text">Portable document</p>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary/30 hover:bg-gray-50 transition-all text-center cursor-pointer"
              >
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-3 text-success" />
                <h3 className="font-semibold text-main-text mb-1">Excel</h3>
                <p className="text-sm text-muted-text">Spreadsheet format</p>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-text">Total Submissions</p>
                  <p className="text-2xl font-bold text-main-text">{selections.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-text">Opted In (Yes)</p>
                  <p className="text-2xl font-bold text-main-text">{optedInCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                  <XCircle className="w-6 h-6 text-muted-text" />
                </div>
                <div>
                  <p className="text-sm text-muted-text">Opted Out (No)</p>
                  <p className="text-2xl font-bold text-main-text">{optedOutCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingReport ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selections.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-main-text mb-2">No selections yet</h3>
              <p className="text-muted-text">No one has submitted their meal preferences for this menu</p>
            </div>
          ) : (
            /* Selections by Meal */
            <div className="space-y-6">
              {selectionsByMeal.map(({ meal, selections: mealSelections }) => (
                <div key={meal.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  {/* Meal Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-main-text">{meal.name}</h3>
                        <p className="text-sm text-muted-text">{meal.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {mealSelections.filter(s => s.optedIn).length} Yes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                            <XCircle className="w-4 h-4 mr-1" />
                            {mealSelections.filter(s => !s.optedIn).length} No
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selections Table */}
                  {mealSelections.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                            Selection
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mealSelections.map((selection, index) => (
                          <tr key={selection.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-text">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-main-text">{selection.userName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-muted-text">{getDepartmentName(selection.department)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {selection.optedIn ? (
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-muted-text">
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-6 py-8 text-center text-muted-text">
                      No selections for this meal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Report Footer */}
          {selections.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-1">
              <p className="text-xs text-muted-text">Canteen Meal Opt-In Management System</p>
              <p className="text-xs text-muted-text">Report generated on {new Date().toLocaleString()}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { RevenueReportDTO, ServicesReportDTO, GuestAnalyticsReportDTO, OccupancyReportDTO } from '../types/reports';
import { httpClient } from './httpClient';

const API_BASE_URL = process.env.REACT_APP_API_URL;

class ReportService {
  private formatDateForServer(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getRevenueReport(startDate: Date, endDate: Date): Promise<RevenueReportDTO> {
    const params = new URLSearchParams({
      startDate: this.formatDateForServer(startDate),
      endDate: this.formatDateForServer(endDate)
    });
    return httpClient.get<RevenueReportDTO>(`/analytics/revenue?${params}`);
  }

  async getOccupancyReport(startDate: Date, endDate: Date): Promise<OccupancyReportDTO> {
    const params = new URLSearchParams({
      startDate: this.formatDateForServer(startDate),
      endDate: this.formatDateForServer(endDate)
    });
    return httpClient.get<OccupancyReportDTO>(`/analytics/occupancy?${params}`);
  }

  async getServicesReport(startDate: Date, endDate: Date): Promise<ServicesReportDTO> {
    const params = new URLSearchParams({
      startDate: this.formatDateForServer(startDate),
      endDate: this.formatDateForServer(endDate)
    });
    return httpClient.get<ServicesReportDTO>(`/analytics/services?${params}`);
  }

  async getGuestAnalyticsReport(startDate: Date, endDate: Date): Promise<GuestAnalyticsReportDTO> {
    const params = new URLSearchParams({
      startDate: this.formatDateForServer(startDate),
      endDate: this.formatDateForServer(endDate)
    });
    return httpClient.get<GuestAnalyticsReportDTO>(`/analytics/guests?${params}`);
  }

  async exportToExcel(reportType: string, startDate: Date, endDate: Date): Promise<Blob> {
    const params = new URLSearchParams({
      startDate: this.formatDateForServer(startDate),
      endDate: this.formatDateForServer(endDate)
    });
    
    const response = await fetch(`${API_BASE_URL}/Analytics/export/excel/${reportType}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  }

  async exportToPdf(reportType: string, startDate: Date, endDate: Date): Promise<Blob> {
    const params = new URLSearchParams({
      startDate: this.formatDateForServer(startDate),
      endDate: this.formatDateForServer(endDate)
    });
    
    const response = await fetch(`${API_BASE_URL}/Analytics/export/pdf/${reportType}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  }

  async exportReport(reportType: string, startDate: Date, endDate: Date, format: 'excel' | 'pdf'): Promise<Blob> {
    if (format === 'excel') {
      return this.exportToExcel(reportType, startDate, endDate);
    } else {
      return this.exportToPdf(reportType, startDate, endDate);
    }
  }
}

export const reportService = new ReportService();
export default reportService;
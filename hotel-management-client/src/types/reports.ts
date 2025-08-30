// Отчет по доходам
export interface RevenueReportDTO {
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  accommodationRevenue: number; 
  serviceRevenue: number; 
  taxAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  staysCount: number;
  averageStayValue: number;
  dailyRevenue: DailyRevenueDetailDTO[];
  monthlyRevenue: MonthlyRevenueDTO[];
  revenueByRoomType: RevenueByRoomTypeDTO[]; 
}

export interface RevenueByRoomTypeDTO {
  roomTypeId: number;
  roomTypeName: string;
  accommodationRevenue: number;
  serviceRevenue: number;
  staysCount: number;
  averageRate: number;
}
export interface DailyRevenueDetailDTO {
  date: Date;
  roomRevenue: number;
  serviceRevenue: number;
  totalRevenue: number;
  staysCount: number;
  averageInvoiceAmount: number;
}

export interface MonthlyRevenueDTO {
  month: string;
  year: number;
  totalRevenue: number;
  accommodationRevenue: number;
  serviceRevenue: number;
  staysCount: number;
}

// Отчет по загруженности
export interface OccupancyReportDTO {
  startDate: Date;
  endDate: Date;
  totalRooms: number;
  averageOccupancyRate: number;
  totalBookings: number; 
  totalStays: number;
  totalNights: number;
  availableRoomNights: number;
  occupiedRoomNights: number;
  roomDetails: RoomOccupancyDetailDTO[];  
  occupancyByRoomType: OccupancyByRoomTypeDTO[];
}

export interface RoomOccupancyDetailDTO {
  roomId: number;
  roomNumber: string;
  roomType: string;
  staysCount: number;
  occupiedNights: number;
  occupancyRate: number;
  revenue: number;
}

export interface OccupancyByRoomTypeDTO {
  roomTypeId: number;
  roomTypeName: string;
  totalRooms: number;
  staysCount: number;
  occupiedNights: number;
  occupancyRate: number;
  revenue: number;  
}

// Отчет по услугам
export interface ServicesReportDTO {
  startDate: Date;
  endDate: Date;
  totalServiceRevenue: number;
  totalServicesOrdered: number;
  averageServiceValue: number;
  paidServiceRevenue: number;
  unpaidServiceRevenue: number;
  servicePopularity: ServicePopularityDetailDTO[];
  employeeServiceStats: EmployeeServiceStatsDTO[];
}

export interface ServicePopularityDetailDTO {
  serviceId: number;
  serviceName: string;
  price: number;
  timesOrdered: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  popularityRank: number;
}

export interface ServiceCategoryDetailDTO {
  category: string;
  servicesCount: number;
  totalOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  averageOrderValue: number;
}

export interface EmployeeServiceStatsDTO {
  employeeId: number;
  employeeName: string;
  position: string;
  servicesProvided: number;
  totalRevenue: number;
  averageServiceValue: number;
}

// Отчет по гостям
export interface GuestAnalyticsReportDTO {
  startDate: Date;
  endDate: Date;
  totalGuests: number;
  newGuests: number;
  returningGuests: number;
  returnGuestRate: number;
  averageStayDuration: number;
  averageSpendingPerGuest: number;
  totalGuestRevenue: number;
  guestSegments: GuestSegmentDetailDTO[];
  topGuests: TopGuestDetailDTO[];
  guestsByCountry: GuestCountryStatsDTO[];
}

export interface GuestSegmentDetailDTO {
  segmentName: string;
  guestCount: number;
  totalRevenue: number;
  averageStayDuration: number;
  averageSpending: number;
  returnRate: number;
}

export interface TopGuestDetailDTO {
  guestId: number;
  guestName: string;
  email: string;
  phone: string;
  citizenship: string;
  staysCount: number;
  totalSpent: number;
  averageStayValue: number;
  lastVisit: Date;
  firstVisit: Date;
}

export interface GuestCountryStatsDTO {
  countryName: string;
  guestCount: number;
  totalRevenue: number;
  averageSpending: number;
  staysCount: number;
}

// Экспорт отчетов
export interface ExportReportRequestDTO {
  reportType: 'revenue' | 'occupancy' | 'services' | 'guests';
  format: 'excel' | 'pdf';
  startDate: Date;
  endDate: Date;
  language: 'ru' | 'en';
}
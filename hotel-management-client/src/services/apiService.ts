// Импортируем все отдельные сервисы
import { roomService } from './roomService';
import { guestService } from './guestService';
import { bookingService } from './bookingService';
import { staffService } from './staffService';
import { serviceService } from './serviceService';
import { invoiceService } from './invoiceService';
import { reportService } from './reportService';
import { serviceSaleService } from './serviceSaleService';
import { stayService } from './stayService';
import { citizenshipService } from './citizenshipService';
import { identificationTypeService } from './identificationTypeService';
import bookingTypeService from './bookingTypeService';
import bookingStatusService from './bookingStatusService';
import { paymentStatusService } from './paymentStatusService';

import { httpClient } from './httpClient';

// Класс-агрегатор для обратной совместимости
class ApiService {
  // HTTP методы
  get = httpClient.get.bind(httpClient);
  post = httpClient.post.bind(httpClient);
  put = httpClient.put.bind(httpClient);
  delete = httpClient.delete.bind(httpClient);

  // Rooms
  getRooms = roomService.getRooms.bind(roomService);
  createRoom = roomService.createRoom.bind(roomService);
  updateRoom = roomService.updateRoom.bind(roomService);
  deleteRoom = roomService.deleteRoom.bind(roomService);
  getRoomById = roomService.getRoomById.bind(roomService);
  getAvailableRooms = roomService.getAvailableRooms.bind(roomService);
  searchAvailableRooms = roomService.searchAvailableRooms.bind(roomService);
  getRoomStatus = roomService.getRoomStatus.bind(roomService);
  getRoomsByType = roomService.getRoomsByType.bind(roomService);
  getRoomsByFloor = roomService.getRoomsByFloor.bind(roomService);
  getRoomTypes = roomService.getRoomTypes.bind(roomService);
  createRoomType = roomService.createRoomType.bind(roomService);
  updateRoomType = roomService.updateRoomType.bind(roomService);
  deleteRoomType = roomService.deleteRoomType.bind(roomService);

  // Guests
  getGuests = guestService.getGuests.bind(guestService);
  createGuest = guestService.createGuest.bind(guestService);
  updateGuest = guestService.updateGuest.bind(guestService);
  deleteGuest = guestService.deleteGuest.bind(guestService);
  createQuickGuest = guestService.createQuickGuest.bind(guestService);

  // Bookings
  getBookings = bookingService.getBookings.bind(bookingService);
  createBooking = bookingService.createBooking.bind(bookingService);
  updateBooking = bookingService.updateBooking.bind(bookingService);
  deleteBooking = bookingService.deleteBooking.bind(bookingService);
  addServiceToBooking = bookingService.addServiceToBooking.bind(bookingService);
  createQuickBooking = bookingService.createQuickBooking.bind(bookingService);

  // Staff
  getStaff = staffService.getStaff.bind(staffService);
  createStaff = staffService.createStaff.bind(staffService);
  updateStaff = staffService.updateStaff.bind(staffService);
  deleteStaff = staffService.deleteStaff.bind(staffService);
  getDepartments = staffService.getDepartments.bind(staffService);
  getEmployeeStatuses = staffService.getEmployeeStatuses.bind(staffService);

  // Services
  getServices = serviceService.getServices.bind(serviceService);
  createService = serviceService.createService.bind(serviceService);
  updateService = serviceService.updateService.bind(serviceService);
  deleteService = serviceService.deleteService.bind(serviceService);

  // Invoices
  getAllInvoices = invoiceService.getAllInvoices.bind(invoiceService);
  getInvoiceByStayId = invoiceService.getInvoiceByStayId.bind(invoiceService);
  getInvoicesByBookingId = invoiceService.getInvoicesByBookingId.bind(invoiceService);
  getInvoicesByGuestId = invoiceService.getInvoicesByGuestId.bind(invoiceService);
  getUnpaidInvoices = invoiceService.getUnpaidInvoices.bind(invoiceService);
  updatePayment = invoiceService.updatePayment.bind(invoiceService);
  getTotalRevenue = invoiceService.getTotalRevenue.bind(invoiceService);

  // Reports
  getRevenueReport = reportService.getRevenueReport.bind(reportService);
  getOccupancyReport = reportService.getOccupancyReport.bind(reportService);
  getServicesReport = reportService.getServicesReport.bind(reportService);
  getGuestAnalyticsReport = reportService.getGuestAnalyticsReport.bind(reportService);
  exportReport = reportService.exportReport.bind(reportService);
  exportToExcel = reportService.exportToExcel.bind(reportService);
  exportToPdf = reportService.exportToPdf.bind(reportService);

  // Service Sales
  getServiceSales = serviceSaleService.getServiceSales.bind(serviceSaleService);
  getServiceSale = serviceSaleService.getServiceSale.bind(serviceSaleService);
  createServiceSale = serviceSaleService.createServiceSale.bind(serviceSaleService);
  updateServiceSale = serviceSaleService.updateServiceSale.bind(serviceSaleService); 
  deleteServiceSale = serviceSaleService.deleteServiceSale.bind(serviceSaleService);
  getServiceSalesByDateRange = serviceSaleService.getServiceSalesByDateRange.bind(serviceSaleService);
  getServiceSalesByEmployee = serviceSaleService.getServiceSalesByEmployee.bind(serviceSaleService);
  getTotalSalesRevenue = serviceSaleService.getTotalSalesRevenue.bind(serviceSaleService);

  // Stays
  getStays = stayService.getStays.bind(stayService);
  createStay = stayService.createStay.bind(stayService);
  updateStay = stayService.updateStay.bind(stayService);
  deleteStay = stayService.deleteStay.bind(stayService);
  getStayById = stayService.getStayById.bind(stayService);
  addGuestToStay = stayService.addGuestToStay.bind(stayService);
  removeGuestFromStay = stayService.removeGuestFromStay.bind(stayService);
  getStaysByGuestId = stayService.getStaysByGuestId.bind(stayService);
  getStaysByRoomId = stayService.getStaysByRoomId.bind(stayService);
  getStaysByDateRange = stayService.getStaysByDateRange.bind(stayService);
  getActiveStays = stayService.getActiveStays.bind(stayService);

  // Identification Types
  getIdentificationTypes = identificationTypeService.getIdentificationTypes.bind(identificationTypeService);
  getIdentificationTypeById = identificationTypeService.getIdentificationTypeById.bind(identificationTypeService);

  // Citizenships
  getCitizenships = citizenshipService.getCitizenships.bind(citizenshipService);
  getActiveCitizenships = citizenshipService.getActiveCitizenships.bind(citizenshipService);
  getCitizenshipById = citizenshipService.getCitizenshipById.bind(citizenshipService);
  
  // Booking Types
  getBookingTypes = bookingTypeService.getBookingTypes.bind(bookingTypeService);
  getBookingTypeById = bookingTypeService.getBookingTypeById.bind(bookingTypeService);
  
  // Booking Statuses
  getBookingStatuses = bookingStatusService.getBookingStatuses.bind(bookingStatusService);
  getBookingStatusById = bookingStatusService.getBookingStatusById.bind(bookingStatusService);
  
  // Payment Statuses
  getPaymentStatuses = paymentStatusService.getPaymentStatuses.bind(paymentStatusService);
  getPaymentStatusById = paymentStatusService.getPaymentStatusById.bind(paymentStatusService);
}

export const apiService = new ApiService();
export default apiService;

// Экспортируем отдельные сервисы для прямого использования
export {
  roomService,
  guestService,
  bookingService,
  staffService,
  serviceService,
  invoiceService,
  reportService,
  serviceSaleService,
  httpClient,
  stayService,
  identificationTypeService,
  citizenshipService
};
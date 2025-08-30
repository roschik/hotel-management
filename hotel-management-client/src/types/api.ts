// Room 
export interface RoomTypeDTO {
  id: number;
  name: string;
  description: string;
}

export interface RoomDTO {
  id: number;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string;
  roomDescription?: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean; 
  hasWifi: boolean;
  hasTV: boolean;
  hasMinibar: boolean;
  hasAirConditioning: boolean;
  hasBalcony: boolean;
  imageUrl?: string;
}

export interface CreateRoomDTO {
  roomNumber: string;
  roomTypeId: number; 
  floor: number;
  capacity: number;
  pricePerNight: number;
  isAvailable?: boolean;
  hasWifi?: boolean;
  hasTV?: boolean;
  hasMinibar?: boolean;
  hasAirConditioning?: boolean;
  hasBalcony?: boolean;
  imageUrl?: string;
}

export interface UpdateRoomDTO {
  roomNumber?: string;
  roomTypeId?: number; 
  floor?: number;
  capacity?: number;
  pricePerNight?: number;
  isAvailable?: boolean; 
  hasWifi?: boolean;
  hasTV?: boolean;
  hasMinibar?: boolean;
  hasAirConditioning?: boolean;
  hasBalcony?: boolean;
  imageUrl?: string;
}

// Guest 
export interface GuestDTO {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: Date | null;
  identificationTypeId: number;
  identificationTypeName?: string;
  identificationNumber?: string;
  identificationIssuedBy?: string;
  identificationIssuedDate?: Date | null;
  notes?: string;
  registrationDate?: Date | null;
  bookingsCount: number;
  createdAt: Date;
  citizenshipId: number; 
  citizenshipName: string; 
  citizenshipCode: string;
}

export interface CreateGuestDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: Date | null;
  identificationTypeId: number;
  identificationNumber?: string;
  identificationIssuedBy?: string;
  identificationIssuedDate?: Date | null;
  registrationDate?: Date | null;
  notes?: string;
  citizenshipId: number; 
}

export interface CreateShortGuestDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone: string;
  identificationTypeId: number;
  citizenshipId: number; 
}

export interface UpdateGuestDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: Date | null;
  identificationTypeId: number;
  identificationNumber?: string;
  identificationIssuedBy?: string;
  identificationIssuedDate?: Date | null;
  registrationDate?: Date | null;
  notes?: string;
  citizenshipId: number; 
}

// IdentificationTypeDTO
export interface IdentificationTypeDTO {
  id: number;
  name: string;
  description: string;
}

// CitizenshipDTO
export interface CitizenshipDTO {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface CreateCitizenshipDTO {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCitizenshipDTO {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// Booking 
export interface BookingDTO {
  id: number;
  guestId: number;
  guestName: string;
  guestPhone: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  bookingTypeId: number;
  bookingTypeName: string;
  bookingStatusId: number;
  bookingStatusName: string;
  checkInDate: string;
  checkOutDate: string;
  basePrice: number;
  totalPrice: number;
  createdAt: Date;
  cancelledAt?: Date;
  updatedAt?: Date;
  notes?: string;
  employeeId?: number;
  employeeName?: string;
  employeePosition?: string;
  stays?: StayDTO[];
}

export interface CreateBookingDTO {
  guestId: number;
  roomId: number;
  bookingTypeId: number;
  bookingStatusId: number;
  checkInDate: string;
  checkOutDate: string;
  basePrice: number;
  totalPrice: number;
  notes?: string;
  employeeId?: number;
}

export interface UpdateBookingDTO {
  roomId: number;
  bookingTypeId: number;
  bookingStatusId: number;
  checkInDate: string;
  checkOutDate: string;
  notes?: string;
  employeeId?: number;
  basePrice: number;
  totalPrice: number;
  updatedAt: Date;
}

// Service 
export interface ServiceDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  durationMinutes: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
}

export interface CreateServiceDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  durationMinutes: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  durationMinutes?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface AddServiceToBookingDTO {
  serviceId: number;
  quantity: number;
  notes?: string;
}

// Employee 
export interface EmployeeDTO {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone: string;
  position: string;
  departmentId: number;
  departmentName: string;
  hireDate: Date;
  salary: number;
  employeeStatusId: number;
  employeeStatusName: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isActive: boolean;
}

export interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone: string;
  position: string;
  departmentId: number;
  salary: number;
  employeeStatusId: number;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UpdateEmployeeDTO {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  position?: string;
  departmentId?: number;
  salary?: number;
  employeeStatusId?: number;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface DepartmentDTO {
  id: number;
  name: string;
  description: string;
}

export interface EmployeeStatusDTO {
  id: number;
  name: string;
  description: string;
}

// Invoice 
export interface InvoiceDTO {
  stayId: number;
  bookingId: number;
  guestId: number;
  guestName: string;
  roomNumber: string;
  issueDate: Date;
  dueDate: Date;
  roomCharges: number;
  serviceCharges: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentDate?: Date;
  transactionId?: string;
  roomTaxAmount: number;
  notes?: string;
  serviceItems: ServiceSaleItemDTO[];
  checkInDate: Date;
  checkOutDate: Date;
  numberOfDays: number;
  dailyRate: number;
  paidServiceCharges: number;
  unpaidServiceCharges: number;
}

export interface CreateInvoiceDTO {
  bookingId: number;
  guestId: number;
  dueDate: Date;
  roomCharges?: number;
  serviceCharges?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
}

export interface UpdatePaymentDTO {
  paidAmount: number;
  paymentStatusId: number;
  paymentDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
}

export interface ServiceSaleItemDTO {
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
  saleDate: Date;
  paymentStatusId: number;
  paymentStatusName: string;
}

// QuickBooking
export interface QuickGuestDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface QuickBookingDTO {
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  guestFirstName: string;
  guestMiddleName?: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  bookingTypeId: number;
  employeeId?: number;
  notes?: string;
}

export interface AvailableRoomSearchDTO {
  checkInDate: Date;
  checkOutDate: Date;
  capacity?: number;
  roomTypeId?: number;
  minPricePerNight?: number;
  maxPricePerNight?: number;
  hasWifi?: boolean;
  hasTV?: boolean;
  hasMinibar?: boolean;
  hasAirConditioning?: boolean;
  hasBalcony?: boolean;
}

export interface AvailableRoomResultDTO {
  id: number;
  roomNumber: string;
  roomTypeName: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  totalPrice: number;
  hasWifi: boolean;
  hasTV: boolean;
  hasMinibar: boolean;
  hasAirConditioning: boolean;
  hasBalcony: boolean;
  imageUrl?: string;
}

export interface NextAvailableDateDTO {
  roomId: number;
  nextAvailableDate: Date;
}

// ServiceSale
export interface ServiceSaleDTO {
  id: number;
  serviceId: number;
  stayId: number;
  serviceName: string;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  guestId?: number;
  guestName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxPercent: number;
  saleDate: Date;
  notes?: string;
  paymentStatusId: number;
  paymentStatusName: string;
  createdAt: Date;
}

export interface CreateServiceSaleDTO {
  serviceId: number;
  employeeId: number;
  guestId?: number;
  stayId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxPercent: number;
  saleDate: Date;
  notes?: string;
  paymentStatusId: number;
}

// BookingTypeDTO 
export interface BookingTypeDTO {
  bookingTypeId: number;
  name: string;
  description: string;
}

// BookingStatusDTO
export interface BookingStatusDTO {
  id: number;
  name: string;
  description: string;
}

// StayDTO
export interface StayDTO {
  stayId: number;
  roomId: number;
  roomNumber: string;
  bookingId: number;
  bookingReference: string;
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
  actualCheckInDate: Date;
  actualCheckOutDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  stayGuests: StayGuestDTO[];
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  paymentStatusId: number;
  paymentStatusName: string;
  paymentDate: Date;
  taxPercent: number;
  taxAmount?: number;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
}

export interface CreateStayDTO {
  bookingId: number;
  actualCheckInDate: Date;
  actualCheckOutDate?: Date;
  notes?: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  paymentStatusId: number;
  taxAmount: number;
  employeeId: number; 
  stayGuests: CreateStayGuestDTO[];
  paymentDate?: Date;
}

export interface UpdateStayDTO {
  bookingId: number;
  actualCheckInDate: Date;
  actualCheckOutDate?: Date;
  notes?: string;
  totalAmount?: number;
  paidAmount?: number;
  dueDate?: Date;
  paymentStatusId?: number;
  taxAmount?: number;
  employeeId?: number; 
  stayGuests: CreateStayGuestDTO[];
  paymentDate?: Date;
}

export interface StayGuestDTO {
  stayGuestId: number;
  stayId: number;
  guestId: number;
  isMainGuest: boolean;
  checkInDate: Date | null; 
  checkOutDate: Date | null; 
  notes: string;
  guestFullName: string;
  guestPhone: string;
  guestEmail: string;
}

export interface CreateStayGuestDTO {
  stayId: number;
  guestId: number;
  isMainGuest: boolean;
  checkedIn: boolean;
  checkedOut: boolean;
  checkInDate?: Date;
  checkOutDate?: Date;
  notes?: string;
}

// PaymentStatusDTO
export interface PaymentStatusDTO {
  id: number;
  name: string;
  description: string;
}


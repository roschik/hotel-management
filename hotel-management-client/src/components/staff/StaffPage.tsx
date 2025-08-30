import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as StaffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import EmployeeForm from './EmployeeForm';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import { apiService } from '../../services/apiService';
import { staffService } from '../../services/staffService';
import { EmployeeDTO, DepartmentDTO, EmployeeStatusDTO, CreateEmployeeDTO, UpdateEmployeeDTO } from '../../types/api';

const StaffPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatusDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    searchConfig,
    setSearchQuery,
    sortConfig,
    handleSort,
    paginationConfig,
    handlePageChange,
    handlePageSizeChange,
    filterConfig,
    handleFilterChange,
    clearFilters,
    selectedItems,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
  } = useTableState({
    initialPageSize: 25,
    initialSort: { field: 'lastName', direction: 'asc' },
  });

  // Загрузка данных
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStaff();
      setEmployees(data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await staffService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Ошибка загрузки департаментов:', error);
    }
  };

  const loadEmployeeStatuses = async () => {
    try {
      const data = await staffService.getEmployeeStatuses();
      setEmployeeStatuses(data);
    } catch (error) {
      console.error('Ошибка загрузки статусов сотрудников:', error);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDepartments();
    loadEmployeeStatuses();
  }, []);

  // Обработчики для форм
  const handleCreateEmployee = async (employeeData: CreateEmployeeDTO) => {
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.createStaff(employeeData);
      setShowCreateDialog(false);
      await loadEmployees();
    } catch (error) {
      console.error('Ошибка создания сотрудника:', error);
      setFormError('Ошибка при создании сотрудника');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEmployee = async (employeeData: UpdateEmployeeDTO) => {
    if (!selectedEmployee) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.updateStaff(selectedEmployee.id.toString(), employeeData);
      setShowEditDialog(false);
      setSelectedEmployee(null);
      await loadEmployees();
    } catch (error) {
      console.error('Ошибка обновления сотрудника:', error);
      setFormError('Ошибка при обновлении сотрудника');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: EmployeeDTO) => {
    if (window.confirm(`Вы уверены, что хотите удалить сотрудника ${employee.firstName} ${employee.lastName}?`)) {
      try {
        setLoading(true);
        console.log('Удаление сотрудника с ID:', employee.id);
        
        await apiService.deleteStaff(employee.id.toString());
        
        await loadEmployees();
      } catch (error) {
        console.error('Ошибка удаления сотрудника:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Функция для фильтрации и поиска данных
  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];
  
    // Применяем поиск
    if (searchConfig.query) {
      const query = searchConfig.query.toLowerCase().trim();
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      filtered = filtered.filter(employee => {
        const fullName = `${employee.firstName} ${employee.lastName} ${employee.middleName || ''}`.toLowerCase();
        const email = employee.email?.toLowerCase() || '';
        const position = employee.position.toLowerCase();
        const departmentName = employee.departmentName?.toLowerCase() || '';

        if (searchWords.length === 1) {
          const searchTerm = searchWords[0];
          return employee.firstName.toLowerCase().includes(searchTerm) ||
                 employee.lastName.toLowerCase().includes(searchTerm) ||
                 employee.middleName?.toLowerCase().includes(searchTerm) ||
                 email.includes(searchTerm) ||
                 position.includes(searchTerm) ||
                 departmentName.includes(searchTerm);
        }
        
        return searchWords.every(word => 
          fullName.includes(word) ||
          email.includes(word) ||
          position.includes(word) ||
          departmentName.includes(word)
        );
      });
    }

    // Применяем фильтры
    if (filterConfig.employeeStatusId) {
      filtered = filtered.filter(employee => employee.employeeStatusId === parseInt(filterConfig.employeeStatusId));
    }

    if (filterConfig.departmentId) {
      filtered = filtered.filter(employee => employee.departmentId === parseInt(filterConfig.departmentId));
    }

    if (filterConfig.position) {
      const position = filterConfig.position.toLowerCase();
      filtered = filtered.filter(employee => 
        employee.position.toLowerCase().includes(position)
      );
    }

    if (filterConfig.hireDate) {
      if (typeof filterConfig.hireDate === 'object' && filterConfig.hireDate.start && filterConfig.hireDate.end) {
        const start = new Date(filterConfig.hireDate.start);
        const end = new Date(filterConfig.hireDate.end);
        filtered = filtered.filter(employee => {
          const hireDate = new Date(employee.hireDate);
          return hireDate >= start && hireDate <= end;
        });
      }
    }

    if (filterConfig.salaryRange) {
      const [minSalary, maxSalary] = filterConfig.salaryRange.split('-').map(Number);
      if (!isNaN(minSalary) && !isNaN(maxSalary)) {
        filtered = filtered.filter(employee => 
          employee.salary >= minSalary && employee.salary <= maxSalary
        );
      }
    }

    // Применяем сортировку
    if (sortConfig?.field) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        // Получаем значения в зависимости от поля сортировки
        switch (sortConfig.field) {
          case 'employee':
            aValue = `${a.lastName} ${a.firstName} ${a.middleName || ''}`;
            bValue = `${b.lastName} ${b.firstName} ${b.middleName || ''}`;
            break;
          case 'position':
            aValue = a.position;
            bValue = b.position;
            break;
          case 'department':
            aValue = a.departmentName || '';
            bValue = b.departmentName || '';
            break;
          case 'status':
            aValue = a.employeeStatusName || '';
            bValue = b.employeeStatusName || '';
            break;
          case 'hireDate':
            aValue = new Date(a.hireDate).getTime();
            bValue = new Date(b.hireDate).getTime();
            break;
          default:
            aValue = a[sortConfig.field as keyof EmployeeDTO];
            bValue = b[sortConfig.field as keyof EmployeeDTO];
        }
    
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const result = aValue.localeCompare(bValue, 'ru', { numeric: true });
          return sortConfig.direction === 'asc' ? result : -result;
        }
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
      });
    }

    return filtered;
  }, [employees, searchConfig.query, filterConfig, sortConfig]);

  // Пагинация отфильтрованных данных
  const paginatedEmployees = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, paginationConfig.page, paginationConfig.pageSize]);

  // Фильтры для персонала
  const filterOptions: FilterOption[] = [
    {
      key: 'employeeStatusId',
      label: 'Статус',
      type: 'select',
      options: employeeStatuses.map(status => ({
        value: status.id.toString(),
        label: status.name
      })),
    },
    {
      key: 'departmentId',
      label: 'Отдел',
      type: 'select',
      options: departments.map(department => ({
        value: department.id.toString(),
        label: department.name
      })),
    },
    {
      key: 'position',
      label: 'Должность',
      type: 'text',
      placeholder: 'Название должности',
    },
    {
      key: 'hireDate',
      label: 'Дата найма',
      type: 'dateRange',
    },
    {
      key: 'salaryRange',
      label: 'Диапазон зарплаты',
      type: 'text',
      placeholder: 'Например: 30000-80000',
    },
  ];

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'employee',
      label: 'Сотрудник',
      sortable: true,
      render: (_, employee) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={employee.avatar}
            sx={{ width: 40, height: 40 }}
          >
            {employee.firstName[0]}{employee.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {employee.firstName} {employee.middleName} {employee.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {employee.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'contact',
      label: 'Контакты',
      render: (_, employee) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2">{employee.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{employee.phone}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'position',
      label: 'Должность',
      sortable: true,
      render: (_, employee) => (
        <Typography variant="body2" fontWeight={600}>
          {employee.position}
        </Typography>
      ),
    },
    {
      key: 'department',
      label: 'Отдел',
      sortable: true,
      render: (_, employee) => (
        <Typography variant="body2">
          {employee.departmentName || 'Не указан'}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      sortable: true,
      render: (_, employee) => {
        const statusConfig = {
          'Активный': { color: 'success' as const },
          'В отпуске': { color: 'warning' as const },
          'Уволен': { color: 'error' as const },
          'На больничном': { color: 'info' as const },
        };
        const config = statusConfig[employee.employeeStatusName as keyof typeof statusConfig];
        return (
          <Chip
            className="status-chip"
            label={employee.employeeStatusName || 'Не указан'}
            color={config?.color || 'default'}
            size="small"
          />
        );
      },
    },
    {
      key: 'hireDate',
      label: 'Дата найма',
      sortable: true,
      width: 120,
      render: (value) => new Date(value).toLocaleDateString('ru-RU'),
    },
  ];

  // Действия для строк таблицы
  const actions: ActionButton[] = [
    {
      key: 'view',
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: (employee) => {
        setSelectedEmployee(employee);
        setShowViewDialog(true);
      },
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (employee) => {
        setSelectedEmployee(employee);
        setShowEditDialog(true);
      },
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: handleDeleteEmployee,
      disabled: (employee) => employee.employeeStatusName === 'Активный',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StaffIcon sx={{ fontSize: 32, color: 'primary.main' }} /> 
          Управление персоналом
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Добавить сотрудника
        </Button>
      </Box>

      {/* Поиск */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <SearchBar
            value={searchConfig.query}
            onChange={setSearchQuery}
            placeholder="Поиск по ФИО, email, должности..."
          />
        </CardContent>
      </Card>

      {/* Фильтры */}
      <FilterPanel
        filters={filterOptions}
        values={filterConfig}
        onChange={handleFilterChange}
        onApply={() => console.log('Применить фильтры')}
        onClear={clearFilters}
        isCollapsed={true}
        showApplyButton={false}
      />

      {/* Таблица */}
      <Card>
        <DataTable
          columns={columns}
          data={paginatedEmployees}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          actions={actions}
          emptyMessage="Сотрудники не найдены"
        />
      </Card>

      {/* Пагинация */}
      <Pagination
        currentPage={paginationConfig.page}
        totalPages={Math.ceil(filteredEmployees.length / paginationConfig.pageSize)}
        pageSize={paginationConfig.pageSize}
        totalItems={filteredEmployees.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Диалог создания */}
      <EmployeeForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setFormError(null);
        }}
        onSubmit={handleCreateEmployee}
        loading={formLoading}
        error={formError}
      />

      {/* Диалог редактирования */}
      <EmployeeForm
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedEmployee(null);
          setFormError(null);
        }}
        onSubmit={handleUpdateEmployee}
        employee={selectedEmployee}
        loading={formLoading}
        error={formError}
      />

      {/* Диалог просмотра */}
      <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Информация о сотруднике</DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12 }} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }} gap={2}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>
                        {selectedEmployee.firstName} {selectedEmployee.middleName} {selectedEmployee.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {selectedEmployee.id}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Email:
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {selectedEmployee.email}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Телефон:
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {selectedEmployee.phone}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Должность:
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.position}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Отдел:
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.departmentName || 'Не указан'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Статус:
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.employeeStatusName || 'Не указан'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Дата найма:
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString('ru-RU') : 'Не указана'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Зарплата:
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.salary?.toLocaleString()} ₽
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Активный:
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.isActive ? 'Да' : 'Нет'}
                  </Typography>
                </Grid>
                
                {selectedEmployee.address && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Адрес:
                    </Typography>
                    <Typography variant="body2">
                      {selectedEmployee.address}
                    </Typography>
                  </Grid>
                )}
                
                {selectedEmployee.emergencyContactName && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Контактное лицо (экстренная связь):
                    </Typography>
                    <Typography variant="body2">
                      {selectedEmployee.emergencyContactName}
                    </Typography>
                  </Grid>
                )}
                
                {selectedEmployee.emergencyContactPhone && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Телефон экстренной связи:
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {selectedEmployee.emergencyContactPhone}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffPage;
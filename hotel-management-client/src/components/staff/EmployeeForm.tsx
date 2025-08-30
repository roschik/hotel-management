import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { EmployeeDTO, DepartmentDTO, EmployeeStatusDTO, CreateEmployeeDTO, UpdateEmployeeDTO } from '../../types/api';
import { staffService } from '../../services/staffService';
import PhoneInput from '../common/PhoneInput';

interface EmployeeFormPropsCreate {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeDTO) => void;
  employee?: null;
  loading?: boolean;
  error?: string | null;
}

interface EmployeeFormPropsUpdate {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateEmployeeDTO) => void;
  employee: EmployeeDTO;
  loading?: boolean;
  error?: string | null;
}

type EmployeeFormProps = EmployeeFormPropsCreate | EmployeeFormPropsUpdate;

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  open,
  onClose,
  onSubmit,
  employee,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<Partial<EmployeeDTO>>(() => ({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    position: '',
    departmentId: 0,
    hireDate: new Date(),
    salary: 0,
    employeeStatusId: 1,
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    isActive: true,
  }));

  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatusDTO[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadEmployeeStatuses();
    }
  }, [open]);

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        position: '',
        departmentId: 0,
        hireDate: new Date(),
        salary: 0,
        employeeStatusId: 1,
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        isActive: true,
      });
    }
    setValidationErrors({});
  }, [employee, open]);

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

  const handleChange = (field: keyof EmployeeDTO) => (event: any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      errors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Фамилия обязательна';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный email';
    }

    if (!formData.phone?.trim()) {
      errors.phone = 'Телефон обязателен';
    }

    if (!formData.position?.trim()) {
      errors.position = 'Должность обязательна';
    }

    if (!formData.departmentId || formData.departmentId === 0) {
      errors.departmentId = 'Отдел обязателен';
    }

    if (!formData.salary || formData.salary <= 0) {
      errors.salary = 'Зарплата должна быть больше 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      if (employee) {
        const updateData: UpdateEmployeeDTO = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          departmentId: formData.departmentId,
          salary: formData.salary,
          employeeStatusId: formData.employeeStatusId,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
        };
        (onSubmit as (data: UpdateEmployeeDTO) => void)(updateData);
      } else {
        const createData: CreateEmployeeDTO = {
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          middleName: formData.middleName,
          email: formData.email,
          phone: formData.phone!,
          position: formData.position!,
          departmentId: formData.departmentId!,
          salary: formData.salary!,
          employeeStatusId: formData.employeeStatusId || 1,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
        };
        (onSubmit as (data: CreateEmployeeDTO) => void)(createData);
      }
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {employee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Фамилия"
                value={formData.lastName || ''}
                onChange={handleChange('lastName')}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Имя"
                value={formData.firstName || ''}
                onChange={handleChange('firstName')}
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Отчество"
                value={formData.middleName || ''}
                onChange={handleChange('middleName')}
                error={!!validationErrors.middleName}
                helperText={validationErrors.middleName}
              />
            </Grid>
                        
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange('email')}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <PhoneInput
                fullWidth
                label="Телефон"
                value={formData.phone || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Должность"
                value={formData.position || ''}
                onChange={handleChange('position')}
                error={!!validationErrors.position}
                helperText={validationErrors.position}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!validationErrors.departmentId}>
                <InputLabel>Отдел *</InputLabel>
                <Select
                  value={formData.departmentId || ''}
                  onChange={handleChange('departmentId')}
                  label="Отдел *"
                >
                  {departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.departmentId && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {validationErrors.departmentId}
                  </Box>
                )}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Дата найма"
                type="date"
                value={formData.hireDate ? new Date(formData.hireDate).toISOString().split('T')[0] : ''}
                onChange={handleChange('hireDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Зарплата"
                type="number"
                value={formData.salary || ''}
                onChange={handleChange('salary')}
                error={!!validationErrors.salary}
                helperText={validationErrors.salary}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Статус сотрудника</InputLabel>
                <Select
                  value={formData.employeeStatusId || 1}
                  onChange={handleChange('employeeStatusId')}
                  label="Статус сотрудника"
                >
                  {employeeStatuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Адрес"
                value={formData.address || ''}
                onChange={handleChange('address')}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Контактное лицо (экстренная связь)"
                value={formData.emergencyContactName || ''}
                onChange={handleChange('emergencyContactName')}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <PhoneInput
                fullWidth
                label="Телефон экстренной связи"
                value={formData.emergencyContactPhone || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, emergencyContactPhone: value }))}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive || false}
                    onChange={handleChange('isActive')}
                  />
                }
                label="Активный сотрудник"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (employee ? 'Обновить' : 'Создать')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeeForm;
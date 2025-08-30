import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { EmployeeDTO } from '../../types/api';
import apiService from '../../services/apiService';

interface EmployeeSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (employee: EmployeeDTO) => void;
  selectedEmployeeId?: number;
}

const EmployeeSelectionModal: React.FC<EmployeeSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedEmployeeId
}) => {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  useEffect(() => {
    if (open) {
      loadEmployees();
    }
  }, [open]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, departmentFilter, positionFilter]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStaff();
      setEmployees(data.filter((emp: EmployeeDTO) => emp.isActive));
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;
    if (searchTerm) {
      const query = searchTerm.toLowerCase().trim();
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      filtered = filtered.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName} ${emp.middleName || ''}`.toLowerCase();
        const email = emp.email?.toLowerCase() || '';
        const phone = emp.phone?.toLowerCase() || '';
  
        if (searchWords.length === 1) {
          const searchTerm = searchWords[0];
          return emp.firstName.toLowerCase().includes(searchTerm) ||
                 emp.lastName.toLowerCase().includes(searchTerm) ||
                 emp.middleName?.toLowerCase().includes(searchTerm) ||
                 email.includes(searchTerm) ||
                 phone.includes(searchTerm);
        }
        
        return searchWords.every(word => 
          fullName.includes(word) ||
          email.includes(word) ||
          phone.includes(word)
        );
      });
    }

    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.departmentName === departmentFilter);
    }

    if (positionFilter) {
      filtered = filtered.filter(emp => emp.position === positionFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleSelect = (employee: EmployeeDTO) => {
    onSelect(employee);
    onClose();
  };

  const uniqueDepartments = Array.from(new Set(employees.map((emp: EmployeeDTO) => emp.departmentName)));

  const uniquePositions = Array.from(new Set(employees.map((emp: EmployeeDTO) => emp.position)));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Выбор ответственного сотрудника</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Поиск по имени, email или телефону"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Отдел</InputLabel>
                <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    label="Отдел"
                >
                    {uniqueDepartments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                        {dept}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Должность</InputLabel>
                <Select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    label="Должность"
                >
                    {uniquePositions.map(pos => (
                    <MenuItem key={pos} value={pos}>
                        {pos}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('');
                setPositionFilter('');
              }}
            >
              Сбросить
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>Контакты</TableCell>
                  <TableCell>Должность</TableCell>
                  <TableCell>Отдел</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow 
                    key={employee.id}
                    selected={selectedEmployeeId === employee.id}
                    hover
                  >
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        #{employee.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          {employee.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.departmentName}</TableCell>
                    <TableCell>
                      <Chip 
                        className='status-chip'
                        label={employee.employeeStatusName} 
                        size="small" 
                        color={employee.employeeStatusName === 'Активный' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={selectedEmployeeId === employee.id ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleSelect(employee)}
                      >
                        {selectedEmployeeId === employee.id ? 'Выбран' : 'Выбрать'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredEmployees.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="text.secondary">
              Сотрудники не найдены
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeSelectionModal;
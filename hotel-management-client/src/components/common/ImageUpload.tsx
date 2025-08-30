import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { fileService } from '../../services/fileService';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // в MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Изображение",
  accept = "image/*",
  maxSize = 5
}) => {
  const [preview, setPreview] = useState<string | null>(
    value ? fileService.getImageUrl(value) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка размера файла
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Размер файла не должен превышать ${maxSize}MB`);
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Удаляем предыдущий файл, если он был загружен через наш API
      if (currentFileName) {
        try {
          await fileService.deleteImage(currentFileName);
        } catch (deleteError) {
          console.warn('Не удалось удалить предыдущий файл:', deleteError);
        }
      }

      // Загружаем новый файл
      const result = await fileService.uploadImage(file);
      const fullImageUrl = fileService.getImageUrl(result.url);
      
      setPreview(fullImageUrl);
      setCurrentFileName(result.fileName);
      onChange(result.url); // Сохраняем относительный путь
      setUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке изображения');
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (currentFileName) {
      try {
        await fileService.deleteImage(currentFileName);
      } catch (deleteError) {
        console.warn('Не удалось удалить файл:', deleteError);
      }
    }
    
    setPreview(null);
    setCurrentFileName(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {preview ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              width: 200,
              height: 150,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <IconButton
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
              },
              width: 24,
              height: 24,
            }}
            size="small"
            disabled={uploading}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box
          onClick={handleClick}
          sx={{
            width: 200,
            height: 150,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            bgcolor: 'grey.50',
            '&:hover': {
              bgcolor: 'grey.100',
              borderColor: 'primary.main',
            },
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            Нажмите для выбора изображения
          </Typography>
        </Box>
      )}
      
      {uploading && (
        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
          Загрузка на сервер...
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      
      <Button
        startIcon={<UploadIcon />}
        onClick={handleClick}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
        disabled={uploading}
      >
        {preview ? 'Изменить изображение' : 'Выбрать изображение'}
      </Button>
    </Box>
  );
};

export default ImageUpload;
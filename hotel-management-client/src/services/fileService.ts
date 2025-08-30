import { httpClient } from './httpClient';

class FileService {
  async uploadImage(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${process.env.REACT_APP_URL}/api/files/upload`, {

      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при загрузке файла');
    }

    return await response.json();
  }

  async deleteImage(fileName: string): Promise<void> {
    await httpClient.delete(`/files/delete?fileName=${encodeURIComponent(fileName)}`);
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // Если это уже полный URL или data URL, возвращаем как есть
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Если это относительный путь, добавляем базовый URL API
    return `${process.env.REACT_APP_URL}${imageUrl}`;
  }
}

export const fileService = new FileService();
export default fileService;
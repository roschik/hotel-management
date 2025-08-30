using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Linq;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

        public FilesController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<object>> UploadFile(IFormFile file)
        {
            try
            {
                // Валидация файла
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { error = "Файл не выбран или пустой" });
                }

                if (file.Length > MaxFileSize)
                {
                    return BadRequest(new { error = $"Размер файла не должен превышать {MaxFileSize / (1024 * 1024)}MB" });
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { error = "Недопустимый тип файла. Разрешены: " + string.Join(", ", _allowedExtensions) });
                }

                // Создание директории для загрузок
                var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "images");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Генерация уникального имени файла
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Сохранение файла
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Возврат URL файла
                var fileUrl = $"/uploads/images/{fileName}";
                return Ok(new { url = fileUrl, fileName = fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ошибка при загрузке файла: " + ex.Message });
            }
        }

        [HttpDelete("delete")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult DeleteFile([FromQuery] string fileName)
        {
            try
            {
                if (string.IsNullOrEmpty(fileName))
                {
                    return BadRequest(new { error = "Имя файла не указано" });
                }

                var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "images");
                var filePath = Path.Combine(uploadsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { error = "Файл не найден" });
                }

                System.IO.File.Delete(filePath);
                return Ok(new { message = "Файл успешно удален" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ошибка при удалении файла: " + ex.Message });
            }
        }
    }
}
using GameBacklog.api.Dtos;
using GameBacklog.api.Models;

namespace GameBacklog.api.Services;

public interface ILogStore
{
    Task<IEnumerable<LogEntry>> GetMyLog(int userId);
    Task<bool> AddToMyLog(int userId, AddLogRequest request);
    Task<bool> UpdateMyLogEntry(int userId, int entryId, UpdateLogRequest request);
    Task<bool> DeleteMyLogEntry(int userId, int entryId);
}
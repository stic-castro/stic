using Quotation.Domain.Models;

namespace Quotation.Application.Abstract;

public interface IBaseService <T, TId> where T : BaseEntity<TId>
{
    Task<IEnumerable<T>> GetAllAsync(int page, int pageSize);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(TId id);
    Task<T> CreateAsync(T entity);
    Task<T> UpdateAsync(TId id, T entity);
    Task<int> SoftDeleteAsync(TId id);
}
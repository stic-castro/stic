using Quotation.Application.Abstract;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;

namespace Quotation.Application.Concrete;

public class MaterialService : BaseService<Material, int>, IMaterialService
{
    public MaterialService(IMaterialRepository repository) : base(repository)
    {
    }
}
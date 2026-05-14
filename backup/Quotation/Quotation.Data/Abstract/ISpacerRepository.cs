using Quotation.Domain.Models;

namespace Quotation.Data.Abstract;

public interface ISpacerRepository : IBaseRepository<Spacer, int>
{
    Task<WheelDetails> GetWheelDetails(string make, string model, int year);
}
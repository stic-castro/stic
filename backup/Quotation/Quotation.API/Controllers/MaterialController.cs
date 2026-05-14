using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Quotation.API.Dtos.Material;
using Quotation.Application.Abstract;
using Quotation.Domain.Models;

namespace Quotation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaterialController : BaseController<Material, MaterialOutputDto, MaterialInputDto, int>
{
    public MaterialController(IMapper mapper, IMaterialService service) : base(mapper, service)
    {
    }
}
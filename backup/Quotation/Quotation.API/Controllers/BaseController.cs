using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Quotation.Application.Abstract;
using Quotation.Domain.Models;

namespace Quotation.API.Controllers;

public abstract class BaseController<T, TOutputDto, TInputDto, TId> : ControllerBase where T : BaseEntity<TId>
{
    protected readonly IMapper _mapper;
    private readonly IBaseService<T, TId> _service;

    protected BaseController(IMapper mapper, IBaseService<T, TId> service)
    {
        _mapper = mapper;
        _service = service;
    }

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TOutputDto>>> GetAll([FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var items = await _service.GetAllAsync(page, pageSize);
        if (items == null || !items.Any()) return NotFound();

        var itemsDto = _mapper.Map<IEnumerable<TOutputDto>>(items);
        return Ok(itemsDto);
    }

    [HttpGet("{id}")]
    public virtual async Task<ActionResult<TOutputDto>> GetById(TId id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();

        return Ok(_mapper.Map<TOutputDto>(item));
    }

    [HttpPost]
    public virtual async Task<ActionResult<TOutputDto>> Create([FromBody] TInputDto inputDto)
    {
        var model = _mapper.Map<T>(inputDto);
        var createdItem = await _service.CreateAsync(model);
        if (createdItem == null) return BadRequest();

        return CreatedAtAction(nameof(GetById), new { id = createdItem.Id }, _mapper.Map<TOutputDto>(createdItem));
    }

    [HttpPut("{id}")]
    public virtual async Task<ActionResult> Update(TId id, [FromBody] TInputDto inputDto, [FromHeader] Guid userId)
    {
        var model = _mapper.Map<T>(inputDto);
        var updatedItem = await _service.UpdateAsync(id, model);
        if (updatedItem == null) return NotFound();

        return Ok(_mapper.Map<TOutputDto>(updatedItem));
    }

    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> SoftDelete(TId id, [FromHeader] Guid userId)
    {
        var result = await _service.SoftDeleteAsync(id);
        return result > 0 ? NoContent() : NotFound();
    }
}
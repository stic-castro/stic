using AutoMapper;

namespace Quotation.API.Dtos;

public interface IMapFrom<T>
{
    void Mapping(Profile profile) => profile.CreateMap(typeof(T), GetType()).ReverseMap();
    
}
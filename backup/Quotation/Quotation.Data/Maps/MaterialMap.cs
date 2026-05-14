namespace Quotation.Data.Maps;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Models;

public class MaterialMap : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        builder.ToTable("Material");
        
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id).IsRequired().ValueGeneratedOnAdd();
        builder.Property(m => m.IsDeleted).IsRequired();
        builder.Property(m => m.CreatedAt).IsRequired();
        
        builder.Property(m => m.PricePerKg)
            .IsRequired();

        builder.Property(m => m.Density)
            .IsRequired();

        builder.Property(m => m.PricePerHourMachine)
            .IsRequired();
        
        builder.Property(m => m.PricePerHourOperator)
            .IsRequired();

        builder.Property(m => m.Name)
            .IsRequired();
    }
}

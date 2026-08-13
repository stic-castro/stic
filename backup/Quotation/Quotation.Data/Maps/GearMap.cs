using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Quotation.Domain.Models;

namespace Quotation.Data.Maps;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Models;

public class GearMap : IEntityTypeConfiguration<Gear>
{
    public void Configure(EntityTypeBuilder<Gear> builder)
    {
        builder.ToTable("Gear");
        
        builder.HasKey(g => g.Id);

        builder.Property(g => g.Id).IsRequired().ValueGeneratedOnAdd();
        builder.Property(g => g.IsDeleted).IsRequired();
        builder.Property(g => g.CreatedAt).IsRequired();

        builder.Property(g => g.MaterialId).IsRequired();
        builder.Property(g => g.UserId)
            .HasMaxLength(450)
            .IsUnicode(false);

        builder.HasOne(g => g.Material)
            .WithMany()
            .HasForeignKey(g => g.MaterialId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(g => g.GearType)
            .HasConversion<int>();
    }
}

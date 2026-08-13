namespace Quotation.Data.Maps;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Models;

public class PulleyMap : IEntityTypeConfiguration<Pulley>
{
    public void Configure(EntityTypeBuilder<Pulley> builder)
    {
        builder.ToTable("Pulley");
        
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .IsRequired()
            .ValueGeneratedOnAdd();

        builder.Property(p => p.IsDeleted).IsRequired();
        builder.Property(p => p.CreatedAt).IsRequired();

        builder.Property(p => p.MaterialId).IsRequired();
        builder.Property(p => p.UserId)
            .HasMaxLength(450)
            .IsUnicode(false);

        builder.Property(p => p.Price)
            .IsRequired();

        builder.HasOne(p => p.Material)
            .WithMany()
            .HasForeignKey(p => p.MaterialId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Property(p => p.OuterDiameter)
            .IsRequired();

        builder.Property(p => p.InnerBoreDiameter)
            .IsRequired();

        builder.Property(p => p.Width)
            .IsRequired();

        builder.Property(p => p.GrooveCount)
            .IsRequired();

        builder.Property(p => p.GrooveType)
            .HasColumnType("char(1)")
            .IsRequired();
    }
}

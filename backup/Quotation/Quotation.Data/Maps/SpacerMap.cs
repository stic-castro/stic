namespace Quotation.Data.Maps;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Models;

public class SpacerMap : IEntityTypeConfiguration<Spacer>
{
    public void Configure(EntityTypeBuilder<Spacer> builder)
    {
        builder.ToTable("Spacers");
        
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .IsRequired()
            .ValueGeneratedOnAdd();

        builder.Property(s => s.IsDeleted).IsRequired();
        builder.Property(s => s.CreatedAt).IsRequired();

        builder.Property(s => s.MaterialId).IsRequired();
        builder.Property(s => s.UserId)
            .HasMaxLength(450)
            .IsUnicode(false);

        builder.Property(s => s.Price)
            .IsRequired();

        builder.Property(s => s.Make)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(s => s.Model)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(s => s.Year)
            .IsRequired();

        builder.HasOne(s => s.Material)
            .WithMany()
            .HasForeignKey(s => s.MaterialId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Property(s => s.BoltCount)
            .IsRequired();

        builder.Property(s => s.BoltPattern)
            .IsRequired();

        builder.Property(s => s.ThicknessMm)
            .IsRequired();

        builder.Property(s => s.CenterBore)
            .IsRequired();

        builder.Property(s => s.IsHubCentric)
            .IsRequired();
    }
}

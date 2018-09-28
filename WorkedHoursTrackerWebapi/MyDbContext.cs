using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace WorkedHoursTrackerWebapi
{
/*
    public class MyDbContextFactory : IDesignTimeDbContextFactory<MyDbContext>
    {

        public MyDbContext CreateDbContext(string[] args)
        {            
            var optionsBuilder = new DbContextOptionsBuilder<MyDbContext>();            
            optionsBuilder.UseNpgsql(config.ConnectionString);

            return new MyDbContext(optionsBuilder.Options);
        }
    }*/

    public class MyDbContext : DbContext
    {

        public MyDbContext(DbContextOptions options) : base(options)
        {
        }

        void CheckValidate(IEnumerable<object> entities)
        {
            foreach (var entity in entities)
            {
                var validCtx = new ValidationContext(entity);
                Validator.ValidateObject(entity, validCtx);
            }
        }

        void MySaveChanges()
        {
            if (Program.MainStarted) // avoid to process these if in migrations
            {
                var entities = from e in ChangeTracker.Entries()
                               where e.State == EntityState.Added || e.State == EntityState.Modified
                               select e.Entity;

                CheckValidate(entities);
            }
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            MySaveChanges();

            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            MySaveChanges();

            return base.SaveChanges();
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            //
            // UNIQUE INDEX
            //
            //builder.Entity<Doc>().HasIndex(x => new { x.id_user, x.description }).IsUnique();

            //
            // INDEX
            //
            //builder.Entity<Doc>().HasIndex(x => x.uuid);

            //
            // DELETE BEHAVIOR
            //
            foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            //
            // DEFAULT VALUES
            //
            //builder.Entity<Doc>().Property(p => p.item2).HasDefaultValue(22);            
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Customer> Customers { get; set; }
    }

}
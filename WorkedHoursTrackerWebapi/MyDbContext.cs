using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using SearchAThing.PsqlUtil;

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

        public const double MIN_COST_DEFAULT = 0.0;

        public const double BASE_COST_DEFAULT = 0.0;

        public const double COST_FACTOR_DEFAULT = 1.0;

        public const int MINUTES_ROUND_DEFAULT = 1;

        static bool psql_initialized = false;
        static object lck_psql_initialized = new object();


        public MyDbContext(DbContextOptions options) : base(options)
        {
            if (!psql_initialized)
            {
                lock (lck_psql_initialized)
                {
                    if (!psql_initialized) this.EnableFirstLastAggregateFunctions();
                    psql_initialized = true;
                }
            }
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
            builder.Entity<UserJob>().HasIndex(x => x.trigger_timestamp);

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
            builder.Entity<Job>().Property(p => p.min_cost).HasDefaultValue(MIN_COST_DEFAULT);
            builder.Entity<Job>().Property(p => p.base_cost).HasDefaultValue(BASE_COST_DEFAULT);
            builder.Entity<Job>().Property(p => p.cost_factor).HasDefaultValue(COST_FACTOR_DEFAULT);
            builder.Entity<Job>().Property(p => p.minutes_round).HasDefaultValue(MINUTES_ROUND_DEFAULT);
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Job> Jobs { get; set; }

        public DbSet<UserJob> UserJobs { get; set; }

        public DbSet<Activity> Activities { get; set; }
    }

}
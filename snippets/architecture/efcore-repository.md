---
id: efcore-repository
title: EF Core Repository Pattern
summary: Simple EF Core repository with asynchronous read and write operations.
framework: dotnet
version: .net8+
language: csharp
category: architecture
tags:
  - efcore
  - repository
  - data-access
  - pattern
  - async
difficulty: beginner
bestPractices:
  - Pass CancellationToken through all async database calls
  - Use constructor injection for testability and clear dependencies
  - Keep repositories focused on a single aggregate root
pitfalls:
  - Avoid exposing IQueryable from the repository to prevent leaky abstractions
  - Calling SaveChangesAsync in every method prevents batching opportunities
---

## Implementation

```csharp
public sealed class ProductRepository(AppDbContext db)
{
    public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task AddAsync(Product entity, CancellationToken ct = default)
    {
        await db.Products.AddAsync(entity, ct);
        await db.SaveChangesAsync(ct);
    }
}
```

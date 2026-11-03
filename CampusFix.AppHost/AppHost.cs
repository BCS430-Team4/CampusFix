var builder = DistributedApplication.CreateBuilder(args);

var database = builder
    .AddPostgres("postgres-server")
    .WithPgAdmin()
    .AddDatabase("campusfix-dev");

var minioUser = builder.AddParameter("minio-user", "admin");
var minioPassword = builder.AddParameter("minio-password", "change-me-long-password", secret: true);

var minio = builder.AddMinioContainer("minio")
    .WithImage("pgsty/silo")
    .WithImageTag("latest")
    .WithEnvironment("MINIO_ROOT_USER", "admin")
    .WithEnvironment("MINIO_ROOT_PASSWORD", "password123")
    .WithEnvironment("SILO_ROOT_USER", "admin")
    .WithEnvironment("SILO_ROOT_PASSWORD", "password123")
    .WithDataVolume("minio-data-volume");

var server = builder.AddProject<Projects.CampusFix_Server>("server")
    .WithHttpHealthCheck("/health")
    .WithReference(database)
    .WithReference(minio) 
    .WaitFor(database)
    .WaitFor(minio)
    .WithExternalHttpEndpoints();

var frontend = builder.AddViteApp("frontend", "../frontend")
    .WithReference(server)
    .WithEnvironment("VITE_BROWSER", "true")
    .WaitFor(server);

server.PublishWithContainerFiles(frontend, "wwwroot");

builder.Build().Run();
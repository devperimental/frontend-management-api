FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /App

ARG NUGET_USERNAME
ARG NUGET_PAT
ARG NUGET_ORGANISATION
# Copy everything
COPY . ./
WORKDIR /App/ManagementApi
# Restore as distinct layers
RUN dotnet nuget add source --username ${NUGET_USERNAME} --password ${NUGET_PAT} --store-password-in-clear-text --name github 'https://nuget.pkg.github.com/architected/index.json'
RUN dotnet restore

# Build and publish a release
RUN dotnet publish "ManagementApi.csproj" -c Release -o ../out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /App
COPY --from=build-env /App/out .
ENTRYPOINT ["dotnet", "ManagementApi.dll"]
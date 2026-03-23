using ClockAttendance.Exceptions;
using ClockAttendance.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace ClockAttendance.Services.Implementations
{
    public class TimeApiIoTimeService : ITimeService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<TimeApiIoTimeService> _logger;

        public TimeApiIoTimeService(HttpClient httpClient, ILogger<TimeApiIoTimeService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<DateTimeOffset> GetZurichNowAsync(CancellationToken ct)
        {
            var url = "https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Zurich";

            try
            {
                var start = DateTime.UtcNow;
                var response = await _httpClient.GetAsync(url, ct);
                var rawResponse = await response.Content.ReadAsStringAsync(ct);

                _logger.LogInformation("Raw response from Time API: {RawResponse}", rawResponse);

                response.EnsureSuccessStatusCode();

                var result = JsonSerializer.Deserialize<TimeApiResponse>(rawResponse);

                if (result == null || result.DateTime == null)
                {
                    throw new Exception("Invalid response from Time API");
                }

                var latency = DateTime.UtcNow - start;
                _logger.LogInformation($"Time API latency: {latency.TotalMilliseconds} ms");

                return result.DateTime.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch time from Time API");
                throw new TimeApiException("Unable to fetch time from Time API", ex);
            }
        }

        private class TimeApiResponse
        {
            [JsonPropertyName("dateTime")]
            public DateTimeOffset? DateTime { get; set; }
        }
    }
}
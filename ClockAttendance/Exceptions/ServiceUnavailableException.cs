using System;

namespace ClockAttendance.Exceptions
{
    public class ServiceUnavailableException : Exception
    {
        public ServiceUnavailableException(string message, Exception innerException) : base(message, innerException) { }
    }
}
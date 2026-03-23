using System;

namespace ClockAttendance.Exceptions
{
    public class TimeApiException : Exception
    {
        public TimeApiException(string message, Exception innerException) : base(message, innerException) { }
    }
}
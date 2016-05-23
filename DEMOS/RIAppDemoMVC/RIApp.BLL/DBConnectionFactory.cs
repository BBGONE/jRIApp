using System;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

namespace RIAppDemo.BLL
{
    public static class DBConnectionFactory
    {
        public const string CONNECTION_STRING_DEFAULT = "DBConnectionStringADW";

        private static string GetConnectionString(string name)
        {
            var connstrings = ConfigurationManager.ConnectionStrings[name];
            if (connstrings == null)
            {
                throw new ApplicationException(string.Format("Connection string {0} is not found in config file", name));
            }
            return connstrings.ConnectionString;
        }

        public static string GetRIAppDemoConnectionString()
        {
            var connStr = GetConnectionString(CONNECTION_STRING_DEFAULT);
            var scsb = new SqlConnectionStringBuilder(connStr);
            return scsb.ToString();
        }

        public static DbConnection GetRIAppDemoConnection()
        {
            var connStr = GetRIAppDemoConnectionString();
            var cn = SqlClientFactory.Instance.CreateConnection();
            cn.ConnectionString = connStr;
            if (cn.State == ConnectionState.Closed)
                cn.Open();
            return cn;
        }
    }
}
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Data.Common;

namespace RIAppDemo.BLL
{
    public static class DBConnectionFactory
    {
        public const string CONNECTION_STRING_DEFAULT = "DBConnectionString";

        private static string GetConnectionString(string name)
        {
            ConnectionStringSettings connstrings = ConfigurationManager.ConnectionStrings[name];
            if (connstrings == null)
            {
                throw new ApplicationException(string.Format("Connection string {0} is not found in config file", name));
            }
            return connstrings.ConnectionString;
        }

        public static string GetRIAppDemoConnectionString()
        {
            string connStr = DBConnectionFactory.GetConnectionString(CONNECTION_STRING_DEFAULT);
            System.Data.SqlClient.SqlConnectionStringBuilder scsb = new SqlConnectionStringBuilder(connStr);
            return scsb.ToString();
        }

        public static DbConnection GetRIAppDemoConnection()
        {
            string connStr = GetRIAppDemoConnectionString();
            DbConnection cn = SqlClientFactory.Instance.CreateConnection();
            cn.ConnectionString = connStr;
            if (cn.State == System.Data.ConnectionState.Closed)
                cn.Open();
            return cn;
        }
    }
}
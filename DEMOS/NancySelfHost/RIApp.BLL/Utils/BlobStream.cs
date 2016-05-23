using System;
using System.Data;
using System.Data.SqlClient;
using System.IO;

namespace RIAppDemo.BLL.Utils
{
	/// <summary>
	/// поток для записи двоичных данных
    /// в поля varbinary SQL SERVER
	/// </summary>
    public class BlobStream: System.IO.Stream
	{
		private SqlConnection m_Connection;
		private string m_TableName;
		private long m_Position;
		private int m_BufferLen;
		private bool m_IsOpen;
		private long m_DataLength;
		private string m_ColName;
		private string m_Where;
		private SqlCommand m_cmdDataLength;
        private SqlCommand m_cmdEmptyColumn;
		private SqlCommand m_cmdUpdateText;
		private SqlCommand m_cmdReadText;
		public override int Read(byte[] buffer, int offset, int count)
		{
			if (!this.m_IsOpen)
			{
				throw new Exception("StreamIsClosed");
			}
			if (buffer == null)
			{
				throw new ArgumentNullException("buffer", "ArgumentNull_Buffer");
			}
			if (offset < 0)
			{
				throw new ArgumentOutOfRangeException("offset","ArgumentOutOfRange_NeedNonNegNum");
			}
			if (count < 0)
			{
				throw new ArgumentOutOfRangeException("count", "ArgumentOutOfRange_NeedNonNegNum");
			}
			if ((buffer.Length - offset) < count)
			{
				throw new ArgumentException("Argument_InvalidOffLen");
			}

			int read=0; 
			if  (this.m_DataLength==0)
				read=0;
			else if (count>(this.m_DataLength-this.m_Position))
				read=(int) (this.m_DataLength-this.m_Position);
			else
				read=count;
			
			long pos=this.m_Position;
			int chunk=0;
			int cnt=0;
			while(read>0)
			{
				if (read>this.m_BufferLen)
				{
					chunk=this.m_BufferLen;
				}
				else
				{
					chunk=read;
				}

				this.m_cmdReadText.Parameters["@offset"].Value=pos;
				this.m_cmdReadText.Parameters["@length"].Value=chunk;

				object obj=this.m_cmdReadText.ExecuteScalar();
				if (obj==null)
				{
					this.m_Position=pos;
					return cnt;
				}
				byte[] res=(byte[]) obj;
				Buffer.BlockCopy(res,0,buffer,offset,res.Length);
				offset+=res.Length;
				read-=chunk;
				pos+=chunk;
				cnt+=res.Length;
				this.m_Position=pos;
			}
			return cnt;
		}
		public override void Write(byte[] buffer, int offset, int count)
		{
			if (count==0)
				return;
			if (!this.m_IsOpen)
			{
				throw new Exception("StreamIsClosed");
			}
			if (buffer == null)
			{
				throw new ArgumentNullException("buffer", "ArgumentNull_Buffer");
			}
			if (offset < 0)
			{
				throw new ArgumentOutOfRangeException("offset","ArgumentOutOfRange_NeedNonNegNum");
			}
			if (count < 0)
			{
				throw new ArgumentOutOfRangeException("count", "ArgumentOutOfRange_NeedNonNegNum");
			}
			if ((buffer.Length - offset) < count)
			{
				throw new ArgumentException("Argument_InvalidOffLen");
			}
						
			byte[] buff=null;
			long append=count;
			long pos=this.m_Position;
				while(append>0)
				{
					int chunk=0;
					if (append>this.m_BufferLen)
					{
						chunk=this.m_BufferLen;
						if (buff==null || buff.Length != chunk)
							buff=new byte[chunk];
					}
					else
					{
						chunk=(int) append;
						buff=new byte[chunk];
					}
					int delete=0;
					if (this.m_DataLength==0)
					{
						delete=0;
					}
					else if (this.m_Position< this.m_DataLength)
					{
						long to_right=this.m_DataLength-this.m_Position;
						if (to_right>chunk)
							delete=chunk;
						else
							delete=(int) to_right;
					}
					else
						delete=0;

					Buffer.BlockCopy(buffer,offset,buff,0,chunk);
					this.m_cmdUpdateText.Parameters["@offset"].Value=pos;
					this.m_cmdUpdateText.Parameters["@length"].Value=delete;
					this.m_cmdUpdateText.Parameters["@data"].Value=buff;
					this.m_cmdUpdateText.ExecuteNonQuery();
					pos+=chunk;
					offset+=chunk;
					append-=chunk;
					this.m_DataLength=this.m_DataLength+chunk-delete;
					this.m_Position=pos;
				}
			
			
		}
		public virtual void Insert(byte[] buffer, int offset, int count)
		{
			if (count==0)
				return;
			if (!this.m_IsOpen)
			{
				throw new Exception("StreamIsClosed");
			}
			if (buffer == null)
			{
				throw new ArgumentNullException("buffer", "ArgumentNull_Buffer");
			}
			if (offset < 0)
			{
				throw new ArgumentOutOfRangeException("offset","ArgumentOutOfRange_NeedNonNegNum");
			}
			if (count < 0)
			{
				throw new ArgumentOutOfRangeException("count", "ArgumentOutOfRange_NeedNonNegNum");
			}
			if ((buffer.Length - offset) < count)
			{
				throw new ArgumentException("Argument_InvalidOffLen");
			}
						
			byte[] buff=null;
			long append=count;
			long pos=this.m_Position;
			while(append>0)
			{
				int chunk=0;
				if (append>this.m_BufferLen)
				{
					chunk=this.m_BufferLen;
					if (buff==null || buff.Length != chunk)
						buff=new byte[chunk];
				}
				else
				{
					chunk=(int) append;
					buff=new byte[chunk];
				}
				int delete=0;
				Buffer.BlockCopy(buffer,offset,buff,0,chunk);
				this.m_cmdUpdateText.Parameters["@offset"].Value=pos;
				this.m_cmdUpdateText.Parameters["@length"].Value=delete;
				this.m_cmdUpdateText.Parameters["@data"].Value=buff;
				this.m_cmdUpdateText.ExecuteNonQuery();
				pos+=chunk;
				offset+=chunk;
				append-=chunk;
				this.m_DataLength=this.m_DataLength+chunk-delete;
				this.m_Position=pos;
			}
		}
		public override long Seek(long offset, SeekOrigin loc)
		{
			if (!this.m_IsOpen)
			{
				throw new Exception("StreamIsClosed");
			}
			if (offset > 0x7fffffff)
			{
				throw new ArgumentOutOfRangeException("offset", "ArgumentOutOfRange_StreamLength");
			}
			switch (loc)
			{
				case SeekOrigin.Begin:
				{
					if (offset < 0)
					{
						throw new IOException("IO.IO_SeekBeforeBegin");
					}
					this.m_Position = offset;
					break;
				}
				case SeekOrigin.Current:
				{
					if ((offset + this.m_Position) < 0)
					{
						throw new IOException("IO.IO_SeekBeforeBegin");
					}
					this.m_Position += offset;
					break;
				}
				case SeekOrigin.End:
				{
					if ((this.m_DataLength + offset) < 0)
					{
						throw new IOException("IO.IO_SeekBeforeBegin");
					}
					this.m_Position = this.m_DataLength +offset;
					break;
 				}
				default:
				{
					throw new ArgumentException("Argument_InvalidSeekOrigin");
				}
			}
			return this.m_Position;
		}
        public override void Flush()
		{

		}
		public override void SetLength(long value)
		{
			if (!this.m_IsOpen)
			{
				throw new Exception("StreamIsClosed");
			}
			long offset=value;
			if (this.m_DataLength<value)
			{
				long append=value-this.m_DataLength;
				offset=this.m_DataLength;
				byte[] buff=null;
				while(append>0)
				{
					long chunk=0;
					if (append>this.m_BufferLen)
					{
						chunk=this.m_BufferLen;
						if (buff==null || buff.Length !=chunk)
							buff=new byte[chunk];
					}
					else
					{
						chunk=append;
						buff=new byte[chunk];
					}
					this.m_cmdUpdateText.Parameters["@offset"].Value=offset;
					this.m_cmdUpdateText.Parameters["@length"].Value=0;
					this.m_cmdUpdateText.Parameters["@data"].Value=buff;
					this.m_cmdUpdateText.ExecuteNonQuery();
					offset+=chunk;
					append-=chunk;
				}
				this.m_DataLength=this.GetLength();
			}
			else
			{
				this.m_cmdUpdateText.Parameters["@offset"].Value=offset;
				this.m_cmdUpdateText.Parameters["@length"].Value=System.DBNull.Value;
				this.m_cmdUpdateText.Parameters["@data"].Value=System.DBNull.Value;
				this.m_cmdUpdateText.ExecuteNonQuery();
				this.m_DataLength=this.GetLength();
				if (this.m_Position>this.m_DataLength)
					this.m_Position=this.m_DataLength;
			}
		}
		public override bool CanRead
		{
			get
			{
				return true;
			}
		}
		public override bool CanWrite
		{
			get
			{
				return true;
			}
		}
		public override bool CanSeek
		{
			get
			{
				return true;
			}
		}

        public override long Length
		{
			get
			{
			//	this.m_DataLength=this.GetLength();
				return this.m_DataLength;
			}
		}
		public override long Position
		{
			get
			{
				return this.m_Position;
			}
			set
			{
				this.m_Position=value;
			}
		}

		private long GetLength()
		{
			object res=this.m_cmdDataLength.ExecuteScalar();
            if (res == null || res is System.DBNull)
				return 0;
			return (long) Convert.ChangeType(res,typeof(long));
		}
		public BlobStream(SqlConnection Connection, string TableName, string ColName, string Where)
		{
			this.m_BufferLen = 1024 * 64; //64KB
			this.m_Connection  = Connection;
			this.m_TableName = TableName;
			this.m_ColName = ColName;
			this.m_Where = Where;
			string cmd_txt=string.Format("SELECT DATALENGTH({0}) AS [LENGTH] FROM {1} {2}",
				this.m_ColName,this.m_TableName,this.m_Where);
			this.m_cmdDataLength=new SqlCommand(cmd_txt,this.m_Connection);

            cmd_txt = string.Format("UPDATE {0} SET {1}=0x {2}",
                this.m_TableName, this.m_ColName, this.m_Where);

            m_cmdEmptyColumn = new SqlCommand(cmd_txt, this.m_Connection);

            cmd_txt=string.Format("UPDATE {0} SET {1} .WRITE (@data, @offset, @length) {2}",
            this.m_TableName, this.m_ColName, this.m_Where);

			this.m_cmdUpdateText=new SqlCommand(cmd_txt,this.m_Connection);
			this.m_cmdUpdateText.Parameters.Add("@data", SqlDbType.VarBinary, System.Int32.MaxValue);
			this.m_cmdUpdateText.Parameters.Add("@offset", SqlDbType.BigInt);
			this.m_cmdUpdateText.Parameters.Add("@length", SqlDbType.BigInt);

            cmd_txt = string.Format("SELECT SUBSTRING({1},@offset+1,@length) AS [CHUNK] FROM {0} WITH (HOLDLOCK) {2}",
                this.m_TableName, this.m_ColName, this.m_Where);

			this.m_cmdReadText=new SqlCommand(cmd_txt,this.m_Connection);
            this.m_cmdReadText.Parameters.Add("@offset", SqlDbType.BigInt);
            this.m_cmdReadText.Parameters.Add("@length", SqlDbType.BigInt);
		}
        public void InitColumn()
        {
            m_cmdEmptyColumn.ExecuteNonQuery();
            this.m_Position = 0;
            this.m_DataLength = 0;
        }
		public void Open()
		{
	    	this.m_Position=0;
            m_DataLength = GetLength();
			m_IsOpen=true;
		}
		public override void Close()
		{
			m_IsOpen=false;
            base.Close();
		}
		public SqlConnection Connection
		{
			get
			{
				return this.m_Connection;
			}
		}
        public bool IsOpen
		{
			get
			{
				return this.m_IsOpen;
			}
		}
	}
}

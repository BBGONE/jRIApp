namespace RIAppDemo.DAL
{
    /// <summary>
    /// Complex type property, for testing complex types 
    /// </summary>
    public class CustomerLvl1
    {
        protected internal Customer _owner;
        private CustomerLvl2 _lvl2;

        public CustomerLvl1(Customer owner)
        {
            this._owner = owner;
            this._lvl2 = new CustomerLvl2(this);
        }

        public string FirstName
        {
            get
            {
                return this._owner.FirstName;
            }
            set
            {
                this._owner.FirstName = value;
            }
        }

        public string MiddleName
        {
            get
            {
                return this._owner.MiddleName;
            }
            set
            {
                this._owner.MiddleName = value;
            }
        }

        public string LastName
        {
            get
            {
                return this._owner.LastName;
            }
            set
            {
                this._owner.LastName = value;
            }
        }

        public CustomerLvl2 ComplexProp
        {
            get
            {
                return this._lvl2;
            }
        }
    }

    /// <summary>
    /// Nested Complex type property, for testing complex types 
    /// </summary>
    public class CustomerLvl2
    {
        private CustomerLvl1 _owner;

        public CustomerLvl2(CustomerLvl1 owner)
        {
            this._owner = owner;
        }

        public string EmailAddress
        {
            get
            {
                return this._owner._owner.EmailAddress;
            }
            set
            {
                this._owner._owner.EmailAddress = value;
            }
        }

        public string Phone
        {
            get
            {
                return this._owner._owner.Phone;
            }
            set
            {
                this._owner._owner.Phone = value;
                //to test refresh after update, uncomment the lines beneath
                /*
                if (this.Phone != null && this.Phone.StartsWith("111"))
                    this.Phone = this.Phone.Replace('111', '###');
                */
            }
        }
    }

    /// <summary>
    /// Extend a Customer class with new properties
    /// </summary>
    public partial class Customer
    {
        private CustomerLvl1 _lvl1;

        partial void OnCreated()
        {
            this._lvl1 = new CustomerLvl1(this);
        }

        partial void OnLoaded()
        {
            this._lvl1 = new CustomerLvl1(this);
        }

        /// <summary>
        /// This field is for testing complex type fields
        /// </summary>
        public CustomerLvl1 ComplexProp
        {
            get
            {
                return this._lvl1;
            }
        }

        /// <summary>
        /// This field is for testing server side calculated fields
        /// </summary>
        public int? AddressCount
        {
            get;
            set;
        }
    }
}

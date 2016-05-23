namespace RIAppDemo.Models
{
    /// <summary>
    ///     Example of containing databindings inside a model. So they are out of the page markup and more reusable.
    /// </summary>
    public class MasterDetailDemo
    {
        public MasterDetailDemo()
        {
            BindGridCustomers =
                "{this.dataSource,to=dbSet,source=customerVM}{this.grid,to=grid,mode=BackWay,source=customerVM}";
            OptionsGridCustomers =
                "options={wrapCss:customerTableWrap,isHandleAddNew:true,editor:{templateID:customerEditTemplate,width:500,height:550,title:'Customer editing'},details:{templateID:customerDetailsTemplate}}";

            BindTableCustOrders =
                "{this.dataSource,to=dbSet,source=customerVM.ordersVM}{this.grid,to=grid,mode=BackWay,source=customerVM.ordersVM}";
            OptionsTableCustOrders =
                "options={isUseScrollIntoDetails:false,isHandleAddNew:true,editor:{templateID:orderEditTemplate,width:650,height:550,title:'Order editing'},details:{templateID:orderDetailsTemplate}}";

            BindAddNewOrder = "{this.command,to=addNewCommand,source=customerVM.ordersVM}";
            OptionsAddNewOrder = "options={tip:This is not a Real World example how to add an order!!!}";
        }

        public string BindGridCustomers { get; set; }
        public string OptionsGridCustomers { get; set; }

        public string BindTableCustOrders { get; set; }
        public string OptionsTableCustOrders { get; set; }

        public string BindAddNewOrder { get; set; }
        public string OptionsAddNewOrder { get; set; }
    }
}
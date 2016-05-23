namespace RIAppDemo.Models
{
    public class SPATemplate
    {
        public SPATemplate()
        {
            BindAddNewOrder = "{this.command,to=addNewCommand,source=customerVM.ordersVM}";
            OptionsAddNewOrder = "options={tip:This is not a Real World example how to add an order!!!}";
        }

        public string BindAddNewOrder { get; set; }
        public string OptionsAddNewOrder { get; set; }
    }
}
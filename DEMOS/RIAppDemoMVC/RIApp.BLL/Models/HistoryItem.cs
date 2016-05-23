using System;
using RIAPP.DataService.DomainService.Attributes;

namespace RIAppDemo.BLL.Models
{
    [List(ListName = "HistoryList")]
    [Comment(Text = "Generated from C# HistoryItem model")]
    [TypeName("IHistoryItem")]
    //[Extends(InterfaceNames= new string[]{"RIAPP.IEditable"})]
    public class HistoryItem
    {
        public string radioValue { get; set; }

        public DateTime time { get; set; }
    }
}
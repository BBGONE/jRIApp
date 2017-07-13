import * as RIAPP from "jriapp";

import * as DEMODB from "../demo/demoDB";
import { ProductViewModel } from "./productVM";
import { ProductsFilter } from "./filters";

//an example how to define a strongly typed command
export class TestInvokeCommand extends RIAPP.BaseCommand<DEMODB.Product, ProductViewModel>
{
    protected Action(sender: RIAPP.IBaseObject, param: DEMODB.Product) {
        let self = this.thisObj;
        self.invokeResult = null;
        let promise = self.dbContext.serviceMethods.TestInvoke({ param1: [10, 11, 12, 13, 14], param2: param.Name });
        promise.then(function (res) {
            self.invokeResult = res;
            self.showDialog();
        }, function () {
            //do something on fail if you need
            //but the error message display is automatically shown
        });
    }
    protected getIsCanExecute(sender: RIAPP.IBaseObject, param: DEMODB.Product): boolean {
        let self = this.thisObj;
        //just for the test: this command can be executed only when this condition is true!
        return self.currentItem !== null;
    }
}

//an example how to define a strongly typed command
export class ResetCommand extends RIAPP.BaseCommand<any, ProductsFilter>
{
    protected Action(sender: RIAPP.IBaseObject, param: any) {
        this.thisObj.reset();
    }
    protected getIsCanExecute(sender: RIAPP.IBaseObject, param: any): boolean {
        return true;
    }
}
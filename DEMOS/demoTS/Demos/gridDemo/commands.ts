import * as RIAPP from "jriapp";

import * as DEMODB from "../demo/demoDB";
import { ProductViewModel } from "./productVM";
import { ProductsFilter } from "./filters";

//an example how to define a strongly typed command
export class TestInvokeCommand extends RIAPP.BaseCommand<ProductViewModel, DEMODB.Product>
{
    protected action(param: DEMODB.Product) {
        const viewModel = this.owner;
        viewModel.invokeResult = null;
        const promise = viewModel.dbContext.serviceMethods.TestInvoke({ param1: [10, 11, 12, 13, 14], param2: param.Name });
        promise.then((res) => {
            viewModel.invokeResult = res;
            viewModel.showDialog();
        });
    }
    protected isCanExecute(param: DEMODB.Product): boolean {
        const viewModel = this.owner;
        //just for the test: this command can be executed only when this condition is true!
        return viewModel.currentItem !== null;
    }
}

//an example how to define a strongly typed command
export class ResetCommand extends RIAPP.BaseCommand<ProductsFilter>
{
    protected action(param: any) {
        this.owner.reset();
    }
    protected isCanExecute(param: any): boolean {
        return true;
    }
}
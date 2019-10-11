import * as dbMOD from "jriapp_db";

declare var toastr: any;
console.log("test1 module loaded on demand");
try {
    throw new dbMOD.AccessDeniedError("Test Error", dbMOD.DATA_OPER.None);
} catch (err) {
    console.log(`test1 module, must be "Test Error": ${err.origError}`);
    toastr.success("Module loaded at " + moment().format('HH:mm:ss'),"test1 module loaded on demand and successfuly imported jriapp_db module");
}
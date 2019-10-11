define(["require", "exports", "jriapp_db"], function (require, exports, dbMOD) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("test1 module loaded on demand");
    try {
        throw new dbMOD.AccessDeniedError("Test Error", 0);
    }
    catch (err) {
        console.log("test1 module, must be \"Test Error\": " + err.origError);
        toastr.success("Module loaded at " + moment().format('HH:mm:ss'), "test1 module loaded on demand and successfuly imported jriapp_db module");
    }
});

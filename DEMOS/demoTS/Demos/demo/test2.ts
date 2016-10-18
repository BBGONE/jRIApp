declare var toastr: any;
toastr.success("Module loaded at " + moment().format('HH:mm:ss'), "test2 module loaded on demand");
console.log("test2 module loaded on demand");
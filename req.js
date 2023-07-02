const db = require("./db");

let code = db.createHost(false);
console.log("Code: ", code);

db.createSync(code, "1124650360426999868");
db.createSync(code, "1122927419670667336");
db.createSync(code, "1095756467841273911");

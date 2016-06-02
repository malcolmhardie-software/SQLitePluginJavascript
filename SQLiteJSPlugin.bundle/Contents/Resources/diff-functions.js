// these functions should help
// to calculate which tables need adding
// dropping or modifying


var DiffExporter = function () {
    
    
    //Console.log("diff export container");

}

DiffExporter.prototype.listOfTablesToAdd = function (container,diffContainer)
{
    
    
}


DiffExporter.prototype.listOfTablesToDrop = function(container,diffContainer)
{
    
    
}


DiffExporter.prototype.listOfTablesToModify = function (container,diffContainer)
{
    
}


DiffExporter.prototype.compareObjectName = function (name1,name2)
{
    
    return false;

}


DiffExporter.prototype.diffExport = function(container,diffContainer)
{
    
    var result = "\n";
    
    
    var resultList = [];
    
    var objectList = container.objects;
    
    var compObjectList = diffContainer.objects;
    
    
    var compObjectListNameAssoc = []
  
    var currentObjectListNames = objectList.map(function(value,index,array) {
        
        return value.fullyQualifiedName;
    });
    
    var compObjectListNames = compObjectList.map(function(value,index,array) {
        
        return value.fullyQualifiedName;
    });




    //result += compObjectListNames;
    
    
    var addedTables = [];
    var modifiedTables = [];
    var deletedTables = [];
    

    
    
    for (var i=0;i<objectList.length;i++) {
        
        var table = objectList[i];
        
        var tableName = table.fullyQualifiedName;
       
        if (compObjectListNames.includes(tableName)) {
            modifiedTables.push(table);
        } else {
            addedTables.push(table);
        }
          
    }
    
    
    for (var j=0;j<compObjectList.length;j++) {
            
        var table = compObjectList[j];
        
        var tableName = table.fullyQualifiedName;
        
        if (!currentObjectListNames.includes(tableName)) {
            deletedTables.push(table);
        }
        
        // setup associative array;
        
        compObjectListNameAssoc[tableName] = table
    }

    var addedTablesNames = addedTables.map(function(value,index,array) {
        
        return value.fullyQualifiedName;
    });
    
    var deletedTablesNames = deletedTables.map(function(value,index,array) {
        
        return value.fullyQualifiedName;
    });
    
    var modifiedTablesNames = modifiedTables.map(function(value,index,array) {
        
        return value.fullyQualifiedName;
    });
    
    

    

    

    // currently there are three separate text blocks
    // which are built at the same time.
    // it might be clearer to separate them
    // ?
    // postload is added at the end
    // preload at the top


    var preloadBlock = ""
    var tableBlock = "";
    var viewBlock = "";
    
    var postLoadBlock = ""
    
    // add new tables

    for (var k=0;k<addedTables.length;k++) {
        var table = addedTables[k];
        if (table.ClassType == "SQLTable") {
            tableBlock += this.addTable(table);
            
            postLoadBlock += this.addTablePostload(table);
        
        } else if (table.ClassType == "SQLView") {
            viewBlock += this.addView(table);
        }
    }
    

    // modify changed tables
    
    //result += "\n\n /*modified : \n "+modifiedTablesNames +"*/\n";
    
    
    for (var k=0;k<modifiedTables.length;k++) {
        var table = modifiedTables[k];
        
        
        var compTable = compObjectListNameAssoc[table.fullyQualifiedName]
        
        if (table.ClassType == "SQLTable") {
            tableBlock += this.modifyTable(table,compTable);
        } else if (table.ClassType === "SQLView") {
            viewBlock += this.modifyView(table,compTable);
        }
    }
    
    // delete removed tables
    
   // result += "\n\n /* deleted: \n "+deletedTablesNames +"*/\n";
    
    for (var k=0;k<deletedTables.length;k++) {
        var table = deletedTables[k];
        if (table.ClassType == "SQLTable") {
            tableBlock += this.dropTable(table);
        } else if (table.ClassType == "SQLView") {
            viewBlock += this.dropView(table);
        }
    }

    
    if (preloadBlock != "") {
        result += preloadBlock
        result += "\n"
    }
    
    if (tableBlock != "") {
        result += tableBlock
        result += "\n"
    }
    
    if (viewBlock != "") {
        result += viewBlock
        result += "\n"
    }
    
    if (postLoadBlock != "") {
        
        result += postLoadBlock
        result += "\n"
    }
    
    
    return result;
}


function ifProp(conditional) {
    return (!((conditional == undefined) || (conditional == false) || (conditional == "0")));
}


DiffExporter.prototype.hasWhiteSpace = function(s) {
  return /\s|\./g.test(s);
}


DiffExporter.prototype.quoteString = function(value) {
    
    
    return "\""+value+"\""
}

DiffExporter.prototype.quoteName = function(value) {
 
    if (this.hasWhiteSpace(value)) {
        return this.quoteString(value);
    }
    return value;
}

DiffExporter.prototype.quotedDefaultValue = function(field) {
    
    
    if (ifProp(field.properties.noQuoteDefault)) {
        return field.properties.defaultValue;
    }
    
    
    return this.quoteString(field.properties.defaultValue);
}



DiffExporter.prototype.quoteObjectName = function(objectName) {



    var parts = objectName.split(".");
    
    if (parts.length == 1) {
        return this.quoteName(objectName);
    }
    
    var schema = parts[0]
    var baseName = parts[1]
    
    return this.quoteName(schema)+"."+this.quoteName(baseName)
    

}

DiffExporter.prototype.commaSeparatedKeyList = function(list,keyName,quoted)
{
    if (list.length == 0) {
        return "";
    }

    var result = list[0][keyName];
    
    if (quoted) {
       result = this.quoteName(result); 
    }

    for (i=1;i<list.length;i++) {
    
        var newValue = list[i][keyName];
        
        
        
        if (quoted) {
            newValue = this.quoteName(newValue);
            
        }
        result += ", "+newValue;
    }
    return result;

    
}

/**
    returns the name of the object
    quoted if it contains spaces
**/
DiffExporter.prototype.nameForObject = function(object) {

        

    return this.quoteObjectName(object.fullyQualifiedName)


}

DiffExporter.prototype.modifyTable = function(table,compTable)
{
    var result = "\n";
    
    //result += "/* alter table "+table.fullyQualifiedName+" */\n"
    
    
    var addedFields = []
    var deletedFields = []
    var modifiedFields = []
    
    
    var associativeCompFields = []
    
    var tableFieldNames = table.fields.map(function(value,index,array) {
        
        return value.name;
    });
    
    
    var compFieldNames = compTable.fields.map(function(value,index,array) {
        
        return value.name;
    });
    
    
    
    // find fields that exist in the current document
    // or which have been added
    
    for (var i=0;i<table.fields.length;i++) {
        
        var field = table.fields[i];
        var fieldName = field.name
        
        if (compFieldNames.includes(fieldName)) {
            modifiedFields.push(field);
        } else {
            addedFields.push(field);
        }
        
    }
    
    // find fields that are in the comp container
    // but not in the current document container
    for (var i=0;i<compTable.fields.length;i++) {
        
        var field = compTable.fields[i];
        var fieldName = field.name
        
        if (!tableFieldNames.includes(fieldName)) {
            deletedFields.push(field);
        }
        
        
        associativeCompFields[fieldName] = field
    }
    
    
    // now generate SQL for each added field
    result += "\n";
    
    for (var i=0;i<addedFields.length;i++) {
        
        var field = addedFields[i];
     
        result += this.addField(table,field);
        
    }
    
    
    // generate SQL for modifying fields that have been removed
    // but only if this dialect supports it
    
    if (this.canModifyColumns()) {
        result += "\n";
        for (var i=0;i<modifiedFields.length;i++) {
        
            var field = modifiedFields[i];
            
     
            var compField = associativeCompFields[field.name]
     
            result += this.dropField(table,field,compField);
        
        }
    
    }
    
    
    
    // generate SQL for dropping fields that have been removed
    // but only if this dialect supports it
    
    if (this.canDropColumns()) {
        result += "\n";
        for (var i=0;i<deletedFields.length;i++) {
        
            var field = deletedFields[i];
     
            result += this.dropField(table,field);
        
        }
    
    }
    

    
    return result;
}


DiffExporter.prototype.canDropColumns = function() { return false }
DiffExporter.prototype.canModifyColumns = function() { return false }

DiffExporter.prototype.dropField = function(table,field)
{
    // sqlite can't drop columns
    // so this won't get called
    
    var result = "ALTER TABLE "+this.nameForObject(table);
    
    result += " DROP COLUMN "
    
    result += field.name;
    
    result += ";\n";
        
    return result
}

DiffExporter.prototype.addField = function(table,field) 
{
    
    var result = "ALTER TABLE "+this.nameForObject(table);
    
    result += " ADD COLUMN "
    
    result += this.fieldSpec(table,field)
    
    result += ";\n";
    
    return result;
}

DiffExporter.prototype.fieldSpec = function(table,field) 
{
    var result = "";
    result += this.quoteName(field.name);
    result += " ";
    result += field.type;

    if (ifProp(field.properties.unique)) {
        result += " UNIQUE"
    }

    if (ifProp(field.properties.notNull)) {
        result += " NOT NULL"
    }

    if (field.properties.defaultValue != "") {
        result += " DEFAULT "+this.quotedDefaultValue(field);
    }
    
    return result;
    
}

DiffExporter.prototype.modifyField = function(table,field,compField)
{
    return "";
    
}


DiffExporter.prototype.dropTable = function(table) 
{
    
    var result = "\nDROP TABLE "+this.nameForObject(table)
    
    result += ";\n";
    
    return result;
}

DiffExporter.prototype.addTable = function(table) 
{
    
    var result = "\nCREATE TABLE "+ this.nameForObject(table)
    
    result += "\n(\n";
    
    for (var i=0;i<table.fields.length;i++) {
        var field = table.fields[i];

        result += this.fieldSpec(table,field)

        if (i<table.fields.length-1 || table.primaryKeyList || table.foreignKeys.length) {
            result += ",\n";
        }
    }

    if (table.primaryKeyList) {

        result += "PRIMARY KEY ("+table.primaryKeyList+")"

        if (table.foreignKeys.length) {
            result += ",\n";
        }
    }

    for (var k=0;k<table.foreignKeys.length;k++) {
        var foreignKey = table.foreignKeys[k];

        result += "FOREIGN KEY ";

        

        result += "("+this.commaSeparatedKeyList(foreignKey.fieldPairs,"sourceFieldName",true)+")";

        result += " REFERENCES ";

        result += this.quoteObjectName(foreignKey.targetTableName);

        result += "("+this.commaSeparatedKeyList(foreignKey.fieldPairs,"targetFieldName",true)+")";

        if (k < table.foreignKeys.length-1) {
            result += ",\n"
        }
    }

    
    
    result += "\n);\n"

    return result;
}


DiffExporter.prototype.addTablePostload = function(table) 
{
    
    var result = "";
    for (var i=0;i<table.indexes.length;i++) {
        
        var curIndex = table.indexes[i];
         
         
        // CREATE INDEX worldgoodbye_test_worldgoodbye_idx_1 ON test.worldgoodbye (id);
        
        if (curIndex.properties.indexType === "UNIQUE") {
                result += "CREATE UNIQUE INDEX "
        } else {
        
            result += "CREATE INDEX "
        }
        
        result += this.quoteName(curIndex.name)
        
        result += " ON "
        
        result += this.nameForObject(table)
        
        
        result += " ("+this.commaSeparatedKeyList(curIndex.indexEntryList,"name",true)+")";
         
        result += ";\n"
         
    }
     
     
    return result;
}

DiffExporter.prototype.addView = function(view)
{
    
    var result = "CREATE VIEW "+this.nameForObject(view)
    
    
    var queryString =  view.properties.queryString
    
    if (undefined == queryString) {
        queryString = "SELECT NULL";
    }
    
    result += " AS "+queryString
    
    if (queryString.trim().slice(-1) != ";") {
        result += ";"
    }
    
    result += "\n"
    
    return result;
}

DiffExporter.prototype.dropView = function(view)
{
    
    return "DROP VIEW "+this.nameForObject(view)+";\n";
}

DiffExporter.prototype.modifyView = function(view,compView)
{
    

    if (view.properties.queryString == compView.properties.queryString) {
        return "";
    }

    return "\n"+this.dropView(view)+this.addView(view);
}




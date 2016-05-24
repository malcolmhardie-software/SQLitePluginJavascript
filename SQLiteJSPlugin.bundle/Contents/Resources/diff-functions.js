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
    
    var result = "/*Diff table list*/\n";
    
    
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
    
    

    
    // add new tables
    
    result += "\n\n /*new: \n"+addedTablesNames +"*/\n";
    

    for (var k=0;k<addedTables.length;k++) {
        var table = addedTables[k];
        result += this.addTable(table);
    }
    

    // modify changed tables
    
    result += "\n\n /*modified : \n "+modifiedTablesNames +"*/\n";
    
    
    for (var k=0;k<modifiedTables.length;k++) {
        var table = modifiedTables[k];
        
        
        var compTable = compObjectListNameAssoc[table.fullyQualifiedName]
        
        result += this.modifyTable(table,compTable);
    }
    
    // delete removed tables
    
    result += "\n\n /* deleted: \n "+deletedTablesNames +"*/\n";
    
    for (var k=0;k<deletedTables.length;k++) {
        var table = deletedTables[k];
        result += this.dropTable(table);
    }
    
    return result;
}


function ifProp(conditional) {
    return (!((conditional == undefined) || (conditional == false) || (conditional == "0")));
}


DiffExporter.prototype.modifyTable = function(table,compTable)
{
    var result = "";
    
    result += "/* alter table "+table.fullyQualifiedName+" */\n"
    
    
    var addedFields = []
    var deletedFields = []
    var modifiedFields = []
    
    
    var tableFieldNames = table.fields.map(function(value,index,array) {
        
        return value.name;
    });
    
    
    var compFieldNames = compTable.fields.map(function(value,index,array) {
        
        return value.name;
    });
    
    
    
    
    for (var i=0;i<table.fields.length;i++) {
        
        var field = table.fields[i];
        var fieldName = field.name
        
        if (compFieldNames.includes(fieldName)) {
            modifiedFields.push(field);
        } else {
            addedFields.push(field);
        }
        
    }
    
    for (var i=0;i<compTable.fields.length;i++) {
        
        var field = compTable.fields[i];
        var fieldName = field.name
        
        if (tableFieldNames.includes(fieldName)) {
            deletedFields.push(field);
        }
        
    }
    
    
    for (var i=0;i<addedFields.length;i++) {
        
        var field = addedFields[i];
     
        result += this.addField(table,field);
        
    }
    
    
    if (this.canDropColumns) {
        
        for (var i=0;i<addedFields.length;i++) {
        
            var field = addedFields[i];
     
            result += this.dropField(table,field);
        
        }
    
    }
    
    return result;
}


DiffExporter.prototype.canDropColumns = false;

// sqlite can't drop columns
DiffExporter.prototype.dropField = function(table,field)
{
    
    return "";   
}

DiffExporter.prototype.addField = function(table,field) 
{
    
    var result = "ALTER TABLE "+table.fullyQualifiedName;
    
    result += " ADD COLUMN "
    
    result += field.name;
    result += " ";
    result += field.type;

    if (ifProp(field.properties.unique)) {
        result += " UNIQUE"
    }

    if (ifProp(field.properties.notNull)) {
        result += " NOT NULL"
    }

    if (field.properties.defaultValue != "") {
        result += " DEFAULT "+field.properties.defaultValue;
    }
    
    result += ";\n";
    
    return result;
}



DiffExporter.prototype.dropTable = function(table) 
{
    
    var result = "\nDROP TABLE "+table.fullyQualifiedName
    
    result += ";\n";
    
    return result;
}

DiffExporter.prototype.addTable = function(table) 
{
    
    var result = "\nCREATE TABLE "+ table.fullyQualifiedName
    
    result += "\n(\n";
    
    for (var i=0;i<table.fields.length;i++) {
        var field = table.fields[i];

        result += field.name;
        result += " ";
        result += field.type;

        if (ifProp(field.properties.unique)) {
            result += " UNIQUE"
        }

        if (ifProp(field.properties.notNull)) {
            result += " NOT NULL"
        }

        if (field.properties.defaultValue != "") {
            result += " DEFAULT "+field.properties.defaultValue;
        }

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

        

        result += "("+commaSeparatedKeyList(foreignKey.fieldPairs,"sourceFieldName")+")";

        result += " REFERENCES ";

        result += foreignKey.targetTableName;

        result += "("+commaSeparatedKeyList(foreignKey.fieldPairs,"targetFieldName")+")";

        if (k < table.foreignKeys.length-1) {
            result += ",\n"
        }
    }

    
    
    result += "\n);\n"

    return result;
}
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
        result += this.modifyTable(table);
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


DiffExporter.prototype.modifyTable = function(table)
{
    var result = "";
    
    result += "/* alter table "+table.fullyQualifiedName+" */\n"
    
    
    
    
    
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
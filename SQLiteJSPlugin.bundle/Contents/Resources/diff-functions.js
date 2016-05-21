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
    
    var result = "table list\n";
    
    
    var resultList = [];
    
    var objectList = container.objects;
    
    var compObjectList = diffContainer.objects
    
  
    var currentObjectListNames = objectList.map(function(value,index,array) {
        
        return value.fullyQualifiedName;
    });
    
    var compObjectListNames = compObjectList.map(function(value,index,array) {
        
        return value.fullyQualifiedName;
    });


    result += compObjectListNames;
    
    
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
    
    result += "\n\n new: \n"+addedTablesNames;
    
    result += "\n\n deleted: \n "+deletedTablesNames
    
    result += "\n\n modified : \n "+modifiedTablesNames
    
    return result;
}
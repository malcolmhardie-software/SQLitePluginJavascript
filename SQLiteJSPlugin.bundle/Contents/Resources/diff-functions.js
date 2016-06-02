// these functions should help
// to calculate which tables need adding
// dropping or modifying


var DiffExporter = function () {
    
    
    //Console.log("diff export container");

}




DiffExporter.prototype.compareObjectName = function (name1,name2)
{
    
    return false;

}

/**
    main export and diff function
    pass in one or two container structures (from SQLEditor)
    returns SQL to modify from container to diffContainer
    (or as close as possible)

    diffContainer may be undefined or empty array to generate a simple export
*/
DiffExporter.prototype.diffExport = function(container,diffContainer)
{
    
    var result = "\n";
    
    
    var resultList = [];
    
    var objectList = container.objects;
    
    var compObjectList = diffContainer.objects;
    
    if ((compObjectList == undefined) || (compObjectList.length == 0)) {
        compObjectList = [];
    }
    
    

    
    

    
    var nameFunction = function(object) {
        return object.fullyQualifiedName;
    }
    
    
    var diffResult = this.calculateDiffSets(objectList,compObjectList,nameFunction);
    
    
    
    

    

    

    

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

    for (var k=0;k<diffResult.added.length;k++) {
        var table = diffResult.added[k];
        if (table.ClassType == "SQLTable") {
            tableBlock += this.addTable(table);
            
            postLoadBlock += this.addTablePostload(table);
        
        } else if (table.ClassType == "SQLView") {
            viewBlock += this.addView(table);
        }
    }
    

    // modify changed tables
    

    
    for (var k=0;k<diffResult.modified.length;k++) {
        var table = diffResult.modified[k];
        
        
        var compTable = diffResult.nameAssoc[table.fullyQualifiedName]
        
        if (table.ClassType == "SQLTable") {
            tableBlock += this.modifyTable(table,compTable);
            
            postLoadBlock += this.modifyTablePostLoad(table,compTable);
            
        } else if (table.ClassType === "SQLView") {
            viewBlock += this.modifyView(table,compTable);
        }
    }
    
    // delete removed tables
    
    
    for (var k=0;k<diffResult.deleted.length;k++) {
        var table = diffResult.deleted[k];
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

/** 
pass in two object lists and a method to generate a comparison string (usually returning the object name)

returns a list of objects that have been added, deleted or modified between the two object lists

also returns lists of the names of those objects (to avoid running another loop on the names)

something of a kitchen sink method perhaps?

**/

DiffExporter.prototype.calculateDiffSets = function(objectList,compObjectList,nameFunction)
{
    
    var diffResult = [];
    
    diffResult.added = []
    diffResult.deleted = []
    diffResult.modified = []
    diffResult.nameAssoc = []
    
    
    diffResult.addedNames = []
    diffResult.deletedNames = []
    diffResult.modifiedNames = []
    
    var nameMapFunction = function(value,index,array) {
        
        return nameFunction(value);
    }
    
    var objectNameList = objectList.map(nameMapFunction);

    var compNameList = compObjectList.map(nameMapFunction);
    
    
    // find fields that exist in the current document
    // or which have been added
    
    for (var i=0;i<objectList.length;i++) {
        
        var field = objectList[i];
        var fieldName = nameFunction(field)
        
        if (compNameList.includes(fieldName)) {
            diffResult.modified.push(field);
            diffResult.modifiedNames.push(fieldName)
        } else {
            diffResult.added.push(field);
            diffResult.addedNames.push(fieldName)
        }
        
    }
    
    // find fields that are in the comp container
    // but not in the current document container
    for (var i=0;i<compObjectList.length;i++) {
        
        var field = compObjectList[i];
        var fieldName = nameFunction(field)
        
        if (!objectNameList.includes(fieldName)) {
            diffResult.deleted.push(field);
            diffResult.deletedNames.push(fieldName)
        }
        
        
        diffResult.nameAssoc[fieldName] = field
    }
    
    
    
    
    
    return diffResult
    

}




DiffExporter.prototype.modifyTable = function(table,compTable)
{
    var result = "\n";
    
    //result += "/* alter table "+table.fullyQualifiedName+" */\n"
    
    

    
    var nameFunction = function(object) {
        return object.name;
    }
    
    
    var diffResult = this.calculateDiffSets(table.fields,compTable.fields,nameFunction);
    
    

    
    // now generate SQL for each added field
    result += "\n";
    
    for (var i=0;i<diffResult.added.length;i++) {
        
        var field = diffResult.added[i];
     
        result += this.addField(table,field);
        
    }
    
    
    // generate SQL for modifying fields that have been removed
    // but only if this dialect supports it
    
    if (this.canModifyColumns()) {
        result += "\n";
        for (var i=0;i<diffResult.modified.length;i++) {
        
            var field = diffResult.modified[i];
            
     
            var compField = diffResult.nameAssoc[field.name]
     
            result += this.modifyField(table,field,compField);
        
        }
    
    }
    
    
    
    // generate SQL for dropping fields that have been removed
    // but only if this dialect supports it
    
    if (this.canDropColumns()) {
        result += "\n";
        for (var i=0;i<diffResult.deleted.length;i++) {
        
            var field = diffResult.deleted[i];
     
            result += this.dropField(table,field);
        
        }
    
    }
    

    
    return result;
}


DiffExporter.prototype.modifyTablePostLoad = function(table,compTable)
{
    

    
    var result = "\n";
    
    //result += "/* modifyTablePostLoad table "+table.fullyQualifiedName+" */\n"
    
    


    
    var nameFunction = function(object) {
        return object.name;
    }
    
    var diffResult = this.calculateDiffSets(table.indexes,compTable.indexes,nameFunction);
    
    // now generate SQL for each added index
    result += "\n";
    
    for (var i=0;i<diffResult.added.length;i++) {
        
        var field = diffResult.added[i];
     
        result += this.addIndex(table,field);
        
    }
    
    for (var i=0;i<diffResult.deleted.length;i++) {
        
        var field = diffResult.deleted[i];
     
        result += this.dropIndex(table,field);
        
    }
    
    for (var i=0;i<diffResult.modified.length;i++) {
        
        var field = diffResult.modified[i];
     
        
 
        var compField = diffResult.nameAssoc[field.name]
 
        //result += this.modifyIndex(table,field,compField);
        
        var fieldExport = this.addIndex(table,field);
        var compExport = this.addIndex(table,compField);
        
        if (fieldExport != compExport) {
        
            result += this.dropIndex(table,field);
            result += this.addIndex(table,field);
        
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


DiffExporter.prototype.addIndex = function(table,curIndex)
{
    
    var result = ""
    
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
    
    return result;
}

DiffExporter.prototype.dropIndex = function(table,theIndex)
{
    
    var result = "ALTER TABLE "
    
    result += this.nameForObject(table)
    result += " DROP INDEX "
    result += this.quoteName(theIndex.name)
    result += ";\n";
    
    return result;
}

DiffExporter.prototype.addTablePostload = function(table) 
{
    
    var result = "";
    for (var i=0;i<table.indexes.length;i++) {
        
        var curIndex = table.indexes[i];
         
        result += this.addIndex(table,curIndex);

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




//
//  MHHandleBarsExporter.m
//  SQLEditorHandlebarsTemplate
//
//  Created by Angus Hardie on 16/06/2015.
//  Copyright (c) 2015 MalcolmHardie Solutions. 
//
//  BSD License Applies

// this a simple export script for SQLEditor (v3 and above)
// www.malcolmhardie.com/sqleditor/

// The SQLEditor app calls init first
// then it calls exportContainer
//
//
// this script generates output using the handlebars templating
// system, but you can do whatever you like in exportContainer


// => currently this happens for every export
// however it is intended that init
// will be called once per exporter
// and then exportContainer will be called multiple times
//


// init method is required
// you should return true if initialization
// was successful
// return false or raise exception if something went wrong 
function init()
{

    //Console.log("init plugin");
   
    
    SQLEditorJS.evaluate("diff-functions.js");
    


    
    return true;
    
}





function exportContainerDiff(jsonContainer,jsonCompContainer)
{

    
    var exporter = new DiffExporter();
    
    var container = JSON.parse(jsonContainer);
    
    

    
    var compContainer = JSON.parse(jsonCompContainer);
    
    

    
    var result = exporter.diffExport(container,compContainer);
    
    return result;
    
}



// exportContainer method is passed a json object
// representing the document object tree
// returns a string as output
function exportContainer(jsonContainer)
{
    
    
    var exporter = new DiffExporter();
    
    var container = JSON.parse(jsonContainer);
    
    

    // empty container for diff
    var compContainer = new Object();
    compContainer.objects = [];
    

    
    var result = "/* SQLite (JS) Plugin Export */\n"
    result += exporter.diffExport(container,compContainer);
    
    
    
    return result;
    
    

}

function defaultTypeForDialect(dialectName)
{
    
    return "INTEGER";
    
}

function typesListForDialect(dialectName)
{
    
    var typesList = [];
    
    
	typesList.push("NUMERIC")
	typesList.push("INTEGER")
	typesList.push("REAL")
	typesList.push("TEXT")
	typesList.push("BLOB")

    return typesList;
    
}


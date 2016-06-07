# SQLEditorJSPlugin
Example Javascript based plugin for SQLEditor


This project demonstrates how to write a simple export plugin for <a href="https://www.malcolmhardie.com/sqleditor/">SQLEditor</a> using Javascript.

This code is similar to the the bundled HTML Report plugin that ships with SQLEditor, except that it doesn't have a binary component and the plugin type is export rather than report.

The binary component in the plugin bundled with SQLEditor is to work around an obscure code signing issue and doesn't actually do anything.

### Plugin Types: Report or Export

Plugins are currently either export type or report type.

* Export plugins offer new document dialects for the source sidebar and the **Export To File** panel. You add a section to the **exportTypes** dictionary in the Info.plist file.
* Report plugins appear in the **Save Report** panel. You add a section to the **reportTypes** dictionary in the Info.plist file.


### Structure

The pure JS plugin consists of a bundle, an Info.plist file and some javascript.

The Info.plist file specifies the main javascript file (under the **scriptFile** key) for the plugin.
You can also evaluate other javscript files.


### Diff

For diff support you must add the **supportsDiff = YES** key value to the **SQLEditorPlugin** InfoPlist section. This example includes that.

You then need to implement the method **exportContainerDiff** in your javascript plugin

You get two json containers, the first is the current document, the second is the comparison document. 

Currently you need to calculate which objects have been added and which removed by diffing these containers.

The code to do this is in the diff-function.js file

I'm hoping to refactor it a bit. :-)

### Building

Current version: No building required, just download and install

### Installing

* SQLEditor plugins should be located in the directory: <br>~/Library/Application Support/SQLEditor/Plugins/

### Using the plugin

* Change the document dialect to the name of the plugin
In this example code, the plugin is currently "SQLite (JS)"

### Live Editing

Once you have installed the plugin, you can actually edit the plugin while SQLEditor is open.

You will need to hit the manual refresh button above the source view


### Limtations

* No database support
* No import support


* Dialect specific type lists are on the way, but require SQLEditor 3.0.2 or later (not yet released)


### SQLEditor specific additions

There is a SQLEditorJS object which offers some special functions:

**SQLEditorJS.evaluate(filename)**

This method loads and then evaluates the specified Javascript file, it should be located in the Resources directory of the plugin

**SQLEditor.contentsOfFile(filename)**

This method loads and returns the contents of the specified file, it should be located in the Resources directory of the plugin


### Feedback

Please send suggestions, feedback or bug reports to support@malcolmhardie.com

Suggestions on more ideomatic javascript or any other technical improvements are extremely welcome.


### Changes 

(See also the git history)

2016-05-19
* Added diff
* Rearranged to be a valid plugin without requiring xcode



2016-05-24
* The example now diffs fields
* Better handling of foreign keys and primary keys

2016-06-02
* Added smarter quoting for object names
* Added index export
* Refactored diff calculation


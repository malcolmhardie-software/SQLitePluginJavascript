# SQLEditorJSPlugin
Example Javascript based plugin for SQLEditor


This project demonstrates how to write a simple export plugin for SQLEditor using Javascript.
It is mostly the same as the bundled HTML Report plugin that ships with SQLEditor.

By modifying the Info.plist file you can also make a report plugin (which adds entries to the Save as Report panel instead)

The pure JS plugin consists of a bundle, an Info.plist file and some javascript.


### Building

* Download the code and open the xcode project.
* Build the plugin

### Installing

* SQLEditor plugins should be located in the directory: <br>~/Library/Application Support/SQLEditor/Plugins/

### Using the plugin

* Change the document dialect to the name of the plugin
In this example code, the plugin is currently "SQLEditor Example Plugin"

### Live Editing

Once you have installed the plugin, you can actually edit while SQLEditor is open.

You will need to hit the manual refresh button above the source view


### Limtations

* Plugins can't do diff support yet
* No database support
* No import support

### SQLEditor specific additions

There is a SQLEditorJS object which offers some special functions:

**SQLEditorJS.evaluate(filename)**

This method loads and then evaluates the specified Javascript file, it should be located in the Resources directory of the plugin

**SQLEditor.contentsOfFile(filename)**

This method loads and returns the contents of the specified file, it should be located in the Resources directory of the plugin


### Feedback

Please send suggestions, feedback or bug reports to support@malcolmhardie.com

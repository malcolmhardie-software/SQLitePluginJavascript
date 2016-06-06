




copyPlugin:
	rsync -r ../SQLiteJSPlugin.bundle ~/Library/Application\ Support/SQLEditor/Plugins/
	
	
	
test: copyPlugin
	/Applications/SQLEditor.app/Contents/MacOS/SQLWorker
	
	
	
watch: 
	  fswatch -o ../SQLiteJSPlugin.bundle | xargs -n1 -I{} make
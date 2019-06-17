
// load Trace Compass modules
loadModule('/TraceCompass/Analysis');
loadModule('/TraceCompass/DataProvider');
loadModule('/TraceCompass/View');
loadModule('/TraceCompass/Utils');

// Create an analysis named activetid.js.
var analysis = getAnalysis("activetid.js");

if (analysis == null) {
	print("Trace is null");
	exit();
} 

//Get the analysis's state system so we can fill it, false indicates to create a new state system even if one already exists, true would re-use an existing state system
var ss = analysis.getStateSystem(false);

function runAnalysis_upgradeJSON() {
	// Get the event iterator for the trace
	var iter = analysis.getEventIterator();
	
	var event = null;
	// Parse all events
	while (iter.hasNext()) {
		
		event = iter.next();
		print("event: "+ event);
		
		var slotName = getFieldValue(event, 'name');
		print("slot name: "+ getFieldValue(event, 'name'));
		
		var argsf =  getFieldValue(event, 'args/Next_state');
		
		print('argsfield:' + argsf)
		print ('timestamp start:' + event.getTimestamp().toNanos())
		
		quark = ss.getQuarkAbsoluteAndAdd(slotName); 
		ss.modifyAttribute(event.getTimestamp().toNanos(), argsf, quark);
		
			
	}
	// Done parsing the events, close the state system at the time of the last event, it needs to be done manually otherwise the state system will still be waiting for values and will not be considered finished building
	if (event != null) {
		ss.closeHistory(event.getTimestamp().toNanos() );
	}
}




// This condition verifies if the state system is completed. For instance, if it had been built in a previous run of the script, it wouldn't run again.
if (!ss.waitUntilBuilt(0)) {
	// State system not built, run the analysis
	runAnalysis_upgradeJSON();
}


// Get a time graph provider from this analysis, displaying all attributes (which are the cpus here)
provider = createTimeGraphProvider(analysis, {'path' : '*'});
//provider = createScriptedTimeGraphProvider(analysis, getEntries, null,null);
if (provider != null) {
	// Open a time graph view displaying this provider
	openTimeGraphView(provider);
}

print("Done");


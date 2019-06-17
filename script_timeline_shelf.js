
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
		
		var stateName = getFieldValue(event, 'name');
		print("state name: "+ getFieldValue(event, 'name'));
		
		var dur = Number(getFieldValue(event, 'dur'));
		
		print("duration:" + dur);
		
		quark = ss.getQuarkAbsoluteAndAdd(stateName); 
		ss.modifyAttribute(event.getTimestamp().toNanos(), stateName, quark);
		
		print ('timestamp start:' + event.getTimestamp().toNanos())
		print ('timestamp end:  ' + (event.getTimestamp().toNanos()+ dur))
		ss.modifyAttribute(event.getTimestamp().toNanos() + dur, null, quark);

		
	}
	// Done parsing the events, close the state system at the time of the last event, it needs to be done manually otherwise the state system will still be waiting for values and will not be considered finished building
	if (event != null) {
		ss.closeHistory(event.getTimestamp().toNanos() + dur);
	}
}




function runAnalysis_upgrade() {
	// Get the event iterator for the trace
	//var iter = analysis.getEventIterator();
	
	//var event = null;
	// Parse all events
	for (var i = 0; i<arr.length; i++) {
		
		print("arr " + arr[i][3])
		print("arr[i][0]" + arr[i][0])
		print("Number(arr[i][0])" + Number(arr[i][0]))
		quark = ss.getQuarkAbsoluteAndAdd(i); // i should be replaced by arr[i][3] ( astring value)
		ss.modifyAttribute(Number(arr[i][0]), arr[i][3], quark);
		ss.modifyAttribute(Number(arr[i][1]), 'null', quark);
		
	}
	// Done parsing the events, close the state system at the time of the last event, it needs to be done manually otherwise the state system will still be waiting for values and will not be considered finished building
	
	ss.closeHistory(Number(arr[i-1][1]));
	
}

//The analysis itself is in this function

function runAnalysis_upgradeCSV() {
	// Get the event iterator for the trace
	var iter = analysis.getEventIterator();
	
	var event = null;
	// Parse all events
	while (iter.hasNext()) {
		
		event = iter.next();
		print("event: "+ event);
		
		var stateName = getFieldValue(event, 'stateName');
		print("state name: "+ getFieldValue(event, 'stateName'));
		
		var tEnd = Number(getFieldValue(event, 'timestampEnd'))*1000000000;
		var dur = Number(getFieldValue(event, 'duration'))*1000000000;
		
		quark = ss.getQuarkAbsoluteAndAdd(stateName); 
		ss.modifyAttribute(event.getTimestamp().toNanos(), stateName, quark);
		
		print ('timestamp start:' + event.getTimestamp().toNanos())
		ss.modifyAttribute(event.getTimestamp().toNanos() + dur, null, quark);
		print ('timestamp end  :' + tEnd)
		
	}
	// Done parsing the events, close the state system at the time of the last event, it needs to be done manually otherwise the state system will still be waiting for values and will not be considered finished building
	if (event != null) {
		ss.closeHistory(event.getTimestamp().toNanos());
	}
}


// This condition verifies if the state system is completed. For instance, if it had been built in a previous run of the script, it wouldn't run again.
if (!ss.waitUntilBuilt(0)) {
	// State system not built, run the analysis
	runAnalysis_upgradeJSON();
	//runAnalysis_upgradeCSV();
}


// Get a time graph provider from this analysis, displaying all attributes (which are the cpus here)
provider = createTimeGraphProvider(analysis, {'path' : '*'});
//provider = createScriptedTimeGraphProvider(analysis, getEntries, null,null);
if (provider != null) {
	// Open a time graph view displaying this provider
	openTimeGraphView(provider);
}

print("Done");


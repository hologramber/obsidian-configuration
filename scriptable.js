// == Purpose ==
// This Scriptable (https://scriptable.app) script creates a widget for iOS screen that pulls information 
// from an Obsidian vault (https://obsidian.md). The widget can display the contents of a file.
//
// == Installation == 
// - On your iOS device, install the Scriptable appliation from the App Store
// - In the Scriptable app, create a new script and copy the contents of this file into that new script. 
// - Rename the script to something useful, e.g. "Obsidian Widget"
// - In Scriptable, create a file bookmark named "ObsidianBookmark"
// - On the iOS screen, add a new widget, selecting the "Scriptable" widget from the list of widgets
// - In the settings for the widget you placed on your screen, edit the widget settings and define the following:
//   - Script - Name of the script you made in Scriptable
//   - When interacting - Leave as "Open app"
//   - Param - either leave blank, if your bookmark is named "ObsidianBookmark" or specify the name of your bookmark

const testParameter="ObsidianBookmark";

const paramBookmark = (args.widgetParameter ? args.widgetParameter : testParameter); 
const refreshRateInSeconds = 100;

const WIDGET_FONTS = {
    small: 		{ WIDGET_TITLE: 20, WIDGET_DESCRIPTION: 12, rowOutput: 5  },
    medium: 		{ WIDGET_TITLE: 20, WIDGET_DESCRIPTION: 12, rowOutput: 5  },
    large: 		{ WIDGET_TITLE: 20, WIDGET_DESCRIPTION: 12, rowOutput: 12 },
    extraLarge: 	{ WIDGET_TITLE: 20, WIDGET_DESCRIPTION: 12, rowOutput: 12 },
    default: 	{ WIDGET_TITLE: 20, WIDGET_DESCRIPTION: 12, rowOutput: 12 }
}

const fm = FileManager.local();
const widget = await createWidget()

if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    //widget.presentMedium();
    widget.presentLarge();
    //widget.presentExtraLarge();
}
Script.complete()

async function createWidget() {
	let widget = new ListWidget();
	widget.refreshAfterDate = new Date(Date.now() + 1000 * refreshRateInSeconds); // add XX second to now
	
  	if( !fm.bookmarkExists(paramBookmark) ) {
	  	errorMessage(widget, "Scriptable bookmark does not exist. Open setting and create a Bookmark to your vault.");
	} else {
  		await displayFile(widget);
	}
	widget.addSpacer();
    return widget;
}

async function displayFile(widget) {
    const vaultPath = fm.bookmarkedPath(paramBookmark); 
    const contentsString = await fm.readString(vaultPath);
    // Trim leading whitespace and newlines while preserving other content
    let trimmedContent = contentsString.replace(/^\s+/, '');
    // Replace checked checkboxes with ☑
    trimmedContent = trimmedContent.replace(/- \[([xX])\]/g, '☑');
    // Replace any other checkbox with □
    trimmedContent = trimmedContent.replace(/- \[.?\]/g, '□');
    // Replace "- " with "• " at start of lines, preserving any leading spaces
    trimmedContent = trimmedContent.replace(/(\n|^)(\s*)- /g, '$1$2• ');
    const row = widget.addStack();
    row.setPadding(0, 0, 0, 0);
    const fileName = row.addText(trimmedContent);
    fileName.textColor = new Color("#ED71DB");
    fileName.font = Font.regularSystemFont(getWidgetFont('WIDGET_DESCRIPTION'));
    row.addSpacer();
}

function errorMessage(widget, msg, url = "" ) {
	const errorText = widget.addText(msg);
	errorText.textColor = Color.white();
	errorText.font = Font.boldSystemFont(getWidgetFont('WIDGET_DESCRIPTION'));
	if(url!="") errorText.url = url;
	return widget;
}

function getWidgetFont(key) {
    return WIDGET_FONTS[config.widgetFamily] ? WIDGET_FONTS[config.widgetFamily][key] : WIDGET_FONTS.default[key];
}

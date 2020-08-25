package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
)

type MenuEntry struct {
	Type      string      `json:"type"`
	Text      string      `json:"text"`
	Href      string      `json:"href"`
	AdminOnly bool        `json:"adminOnly"`
	Content   []MenuEntry `json:"content"`
}

/**
read, parse and unmarshal the json. Exits the program with an error message if the data is not valid.
*/
func read_data(filename string) []MenuEntry {
	file, openErr := os.Open(filename)
	if openErr != nil {
		fmt.Printf("Could not open file '%s': %s\n", filename, openErr)
		os.Exit(1)
	}
	defer file.Close()

	rawContent, readErr := ioutil.ReadAll(file)
	if readErr != nil {
		fmt.Printf("Could not read file '%s': %s\n", filename, readErr)
		os.Exit(1)
	}

	var entries []MenuEntry
	marshalErr := json.Unmarshal(rawContent, &entries)

	if marshalErr != nil {
		fmt.Printf("Menu from '%s' is not valid: %s\n", filename, marshalErr)
		os.Exit(1)
	}
	return entries
}

/**
performs a deep validation of a list of menu entries.  Any that contain sub-levels are then recursively validated by the
same function.
:param entries: a pointer a a list of MenuEntry to validate
:param level: an integer representing the recursion level. Call this with 0 to start.
:returns: a boolean indicating True for failure or False for success
*/
func recursivelyValidate(entries *[]MenuEntry, level int) bool {
	did_fail := false
	for i, entry := range *entries {
		if entry.Text == "" {
			fmt.Printf("Menu entry %d at sublevel %d has no menu text\n", i, level)
			did_fail = true
		}
		if entry.Type != "link" && entry.Type != "submenu" {
			fmt.Printf("Menu entry %d at level %d (%s) has an invalid type %s - expecting 'link' or 'submenu'\n", i, level, entry.Text, entry.Type)
			did_fail = true
		}
		if entry.Href == "" && entry.Content == nil {
			fmt.Printf("Menu entry %d at level %d (%s %s) has blank href and content\n", i, level, entry.Type, entry.Text)
			did_fail = true
		}
		if entry.Href != "" && entry.Content != nil {
			fmt.Printf("Menu entry %d at level %d (%s %s) has both href and content set\n", i, level, entry.Type, entry.Text)
			did_fail = true
		}
		if entry.Href != "" {
			_, urlErr := url.Parse(entry.Href)
			if urlErr != nil {
				fmt.Printf("Link for menu entry %d at level %d (%s %s) is not valid: %s\n", i, level, entry.Type, entry.Text, urlErr)
				did_fail = true
			}
		}
		if entry.Content != nil && len(entry.Content) > 0 {
			subLevelFailed := recursivelyValidate(&entry.Content, level+1)
			if subLevelFailed {
				did_fail = true
			}
		}
	}
	return did_fail
}

func main() {
	filename := flag.String("file", "/etc/menu.json", "the menu.json file to validate")
	flag.Parse()

	entries := read_data(*filename)

	//carry out the _whole_ validation and only exit at the end so we can see all the errors
	did_fail := recursivelyValidate(&entries, 0)

	if did_fail {
		fmt.Printf("Validation of %s failed, see above errors for details\n", *filename)
		os.Exit(1)
	}
	fmt.Printf("Validation of %s succeeded!\n", *filename)
	os.Exit(0)
}

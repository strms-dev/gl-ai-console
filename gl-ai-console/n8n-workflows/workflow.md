Planning Phase

Analyze my workflow request and create a [use-case.md](http://use-case.md/) file that describes:

- What the workflow should do
- How it starts (trigger)
- Step-by-step process
- What services it connects to
- What the output should be
- What could go wrong

Don't research any nodes yet, just understand what I need.

Research Phase

Read [use-case.md](http://use-case.md/) and research all the n8n nodes needed for this workflow using MCP tools.
For each step, find the right node, get its essential properties, and check if it uses OAuth.
Save everything to [node-research.md](http://node-research.md/) with node names, configurations, and examples.

Build Phase

Read [use-case.md](http://use-case.md/), [node-research.md](http://node-research.md/).
Build the workflow JSON using the researched nodes.
Validate it, then save as workflow.json.
Don't deploy yet.

Validate Phase

Read workflow.json and check every node configuration against official docs.
For each node in the workflow:

- Use get_node_documentation() to get official docs
- Use validate_node_operation() to validate the config
- Check if all required fields are present
- Verify OAuth is used where available
Report any issues found. Fix workflow.json if needed.
Once all validations pass, deploy by deleting any existing workflow and creating new.
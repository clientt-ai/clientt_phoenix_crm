# Figma MCP Chunked Server Setup

This directory contains the Figma MCP Chunked server, which enables AI assistants to work with large Figma files by processing them in manageable chunks.

## Prerequisites

- Node.js installed
- Figma account with a Dev or Full seat on a Professional, Organization, or Enterprise plan
- Figma Personal Access Token

## Getting Your Figma Access Token

1. Log into your Figma account
2. Go to Settings → Account
3. Navigate to "Personal access tokens"
4. Generate a new token and save it securely

## Directory Structure

```
figma_mcp_chunker/
├── figma-mcp-chunked/          # Cloned repository
│   ├── build/                   # Compiled JavaScript (generated)
│   ├── src/                     # TypeScript source code
│   ├── node_modules/            # Dependencies
│   └── package.json             # Project configuration
├── SETUP.md                     # This file - complete setup guide
├── DESIGNS.md                   # Quick reference for all configured designs
├── config.template.json         # Configuration template
├── config.json                  # Your configuration (create from template)
└── .gitignore                   # Protects sensitive config files
```

## Configuration

### Option 1: Environment Variable (Recommended for Development)

Set your Figma access token as an environment variable:

```bash
export FIGMA_ACCESS_TOKEN="your-figma-token-here"
```

### Option 2: Configuration File

Create a `config.json` file in the `figma_mcp_chunker` directory:

```json
{
  "mcpServers": {
    "figma-chunked": {
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-figma-token-here"
      }
    }
  },
  "designs": {
    "105 Form design": {
      "fileId": "xGaucKjUbmEsgDqxjVvnU5",
      "url": "https://www.figma.com/design/xGaucKjUbmEsgDqxjVvnU5/105-Forms-design",
      "description": "Forms design for feature 105"
    }
  }
}
```

#### Adding Your Figma Designs

The `designs` section allows you to map friendly names to Figma file IDs for easy reference:

**How to extract the File ID from a Figma URL:**

From a Figma URL like:
```
https://www.figma.com/design/xGaucKjUbmEsgDqxjVvnU5/105-Forms-design?t=L8GOi9ZhsEEW5Eui-0
```

The file ID is: `xGaucKjUbmEsgDqxjVvnU5` (the part between `/design/` and the next `/`)

**Example design mapping:**

```json
"designs": {
  "Your Design Name": {
    "fileId": "your-file-id-here",
    "url": "https://www.figma.com/design/your-file-id-here/your-design-name",
    "description": "Optional description of this design"
  },
  "Another Design": {
    "fileId": "another-file-id",
    "url": "https://www.figma.com/design/another-file-id/design-name",
    "description": "Another design description"
  }
}
```

When using the MCP server, you can reference designs by their friendly name or use the fileId directly.

## MCP Client Configuration

### For Claude Desktop

Edit your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "figma-chunked": {
      "command": "node",
      "args": [
        "/Users/jeffreyleng/Clientt/ClienttPhoenixCRM/clientt_phoenix_crm_01/figma_integration/figma_mcp_chunker/figma-mcp-chunked/build/index.js"
      ],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-figma-token-here"
      }
    }
  }
}
```

### For VS Code with Claude

Add to your VS Code settings or workspace configuration:

```json
{
  "claude.mcpServers": {
    "figma-chunked": {
      "command": "node",
      "args": [
        "/Users/jeffreyleng/Clientt/ClienttPhoenixCRM/clientt_phoenix_crm_01/figma_integration/figma_mcp_chunker/figma-mcp-chunked/build/index.js"
      ],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-figma-token-here"
      }
    }
  }
}
```

## Running the Server

### Direct Execution

```bash
cd figma-mcp-chunked
export FIGMA_ACCESS_TOKEN="your-token"
node build/index.js
```

### With Configuration File

```bash
cd figma-mcp-chunked
node build/index.js --config=../config.json
```

### Debug Mode

Enable detailed logging:

```bash
export DEBUG=true
node build/index.js
```

## Configuration Options

The server supports these optional parameters for memory management:

- **pageSize**: Number of nodes processed per chunk (default: 100)
- **maxMemoryMB**: Memory limit in megabytes (default: 512)
- **nodeTypes**: Filter specific node types (e.g., FRAME, COMPONENT)
- **depth**: Control traversal depth for nested structures

Example with custom options:

```bash
node build/index.js --pageSize=200 --maxMemoryMB=1024
```

## Testing the Setup

Once configured in your MCP client, test the connection by asking:

```
Using the figma-chunked server, list the files in my project with ID '12345:67890'
```

Replace `12345:67890` with your actual Figma project ID.

## Usage Examples

### List Figma Files
```
List all Figma files in my project
```

### Analyze a Figma Design (Using File ID)
```
Get the design structure for Figma file xGaucKjUbmEsgDqxjVvnU5
```

### Working with the "105 Form design"
```
Analyze the components in the 105 Form design (file ID: xGaucKjUbmEsgDqxjVvnU5)
```

```
Extract all form components from Figma file xGaucKjUbmEsgDqxjVvnU5
```

```
Get the layout structure of the 105 Forms design
```

### Extract Components
```
Extract all components from Figma file xGaucKjUbmEsgDqxjVvnU5
```

### Get Specific Nodes
```
Get node 1:2 from the 105 Form design (file: xGaucKjUbmEsgDqxjVvnU5)
```

## Troubleshooting

### Authentication Errors
- Verify your Figma access token is valid
- Ensure you have the required Figma plan (Dev or Full seat)
- Check that the token hasn't expired

### Memory Issues
- Reduce the `pageSize` parameter
- Increase the `maxMemoryMB` limit
- Filter by specific `nodeTypes` to reduce data volume

### Connection Problems
- Verify the path to `build/index.js` is correct in your MCP configuration
- Ensure Node.js is installed and accessible
- Check that the build directory exists and contains compiled files

## Maintenance

### Updating the Server

```bash
cd figma-mcp-chunked
git pull origin main
npm install
npm run build
```

### Rebuilding

If you make changes to the source code:

```bash
cd figma-mcp-chunked
npm run build
```

## Security Notes

- **Never commit your Figma access token to version control**
- Store tokens in environment variables or secure configuration files
- Use `.gitignore` to exclude `config.json` with sensitive data
- Rotate tokens regularly for security

## Additional Resources

- [GitHub Repository](https://github.com/ArchimedesCrypto/figma-mcp-chunked)
- [Setup Guide](https://skywork.ai/skypage/en/figma-large-files-archimedes-server/1978305615257604096)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)

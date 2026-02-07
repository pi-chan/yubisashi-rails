# <yubisashi-rails>

A visual UI annotation tool for Rails views. Click elements on the page to record feedback, then copy structured Markdown / JSON output for AI coding agents.

Leverages `annotate_rendered_view_with_filenames` HTML comments to automatically identify template files.

## Usage

In config/environments/development.rb:

```ruby
config.action_view.annotate_rendered_view_with_filenames = true
```

In app/views/layouts/application.html.erb:

```erb
<!DOCTYPE html>
<html>
<head>
<!-- ... -->
</head>
<body>

<%= yield %>

<% if Rails.env.development? %>
  <script type="module" src="https://cdn.jsdelivr.net/npm/yubisashi-rails@latest/dist/yubisashi-rails.mjs"></script>
  <yubisashi-rails root="<%= Rails.root %>" combo-key="command-shift-a"></yubisashi-rails>
<% end %>
</body>
</html>
```

## Features

- Click any element to identify its template file and copy the path to clipboard
- Add comments via popover to describe what should be changed
- Capture selected text context
- Number badges to visualize annotated elements
- Side panel to list, edit, and delete annotations
- Copy all annotations as Markdown or JSON
- Dark mode support

## Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `root` | `/` | Rails.root path |
| `combo-key` | `command-shift-a` | Keyboard shortcut to toggle |
| `position` | `bottom-right` | Toolbar position (`bottom-right` / `bottom-left`) |
| `format` | `markdown` | Output format (`markdown` / `json`) |
| `theme` | `auto` | Theme (`auto` / `light` / `dark`) |

`combo-key` accepts any combination of modifiers `control`, `shift`, `alt`, `meta`, `command` followed by a key, separated by `-` (e.g. `control-shift-i`, `meta-shift-a`).

## Output Example

### Markdown

```markdown
# UI Annotations

> Page: http://localhost:3000/users
> Timestamp: 2025-01-01T00:00:00.000Z

## #1 Change heading color to blue

- **File**: `app/views/users/index.html.erb`
- **Selector**: `h1`
- **Text**: "Users"
- **Bounding box**: x=20, y=80, w=760, h=32
```

### JSON

```json
{
  "page": "http://localhost:3000/users",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "annotations": [
    {
      "id": 1,
      "comment": "Change heading color to blue",
      "element": {
        "tagName": "h1",
        "selector": "h1",
        "classes": [],
        "text": "Users",
        "boundingBox": { "x": 20, "y": 80, "width": 760, "height": 32 },
        "dataAttributes": {}
      },
      "source": {
        "file": "app/views/users/index.html.erb"
      }
    }
  ]
}
```

## Development

```bash
pnpm install
pnpm dev          # dev server
pnpm test         # run tests
pnpm build        # build for production
```

## License

MIT

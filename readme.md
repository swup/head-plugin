# Swup Head Plugin

Plugin serves to replace the contents of head tag when the content of the page is replaced.
Primary reason for this can be usage of different style files included with a `link` for different pages.

**Note:** This plugin is rather experimental and any improvements or comments are more than welcome.

## Instalation

This plugin can be installed with npm

```bash
npm install @swup/head-plugin
```

and included with import

```javascript
import SwupHeadPlugin from '@swup/head-plugin';
```

or included from the dist folder

```html
<script src="./dist/SwupHeadPlugin.js"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupHeadPlugin()]
});
```

## Options

### persistAssets

Whether to keep orphaned `link`, `style` and `script` tags from the old page
that weren't included on the new page. Useful for third-party libraries that
add custom styles but can only be run once.

Defaults to `false`, i.e. orphaned assets will be removed.

Setting it to `true` acts as a shortcut for setting the `persistTags` option to
a selector of `link[rel=stylesheet], script[src], style`.

```javascript
new SwupHeadPlugin({
  persistAssets: true
})
```

### persistTags

Define which tags will be persisted when a new page is loaded.

Defaults to `false`, i.e. all orphaned tags will be removed.

```javascript
new SwupHeadPlugin({
  // Keep all orphaned tags
  persistTags: true,

  // Keep all tags that match a CSS selector
  persistTags: 'style[data-keep-style]',

  // Use a function to determine whether to keep a tag
  persistTags: (tag) => tag.children.length > 1
})
```

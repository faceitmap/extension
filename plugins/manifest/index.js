const WebpackAssetsManifest = require('webpack-assets-manifest')
const template = require('./template')
const PLUGIN_NAME = 'ExtensionManifest'

const manifest = new WebpackAssetsManifest({
    output: 'manifest.json'
})


manifest.hooks.transform.tap(PLUGIN_NAME, (assets) => {
    template.content_scripts.push({
        run_at: "document_end",
        matches: ["https://www.faceit.com/*"],
        js: [ assets['content.js'] ]
    })

    template.background.scripts.push(assets['background.js'])

    return template
})

// vm.currentMatch.derived.currentUserFactionName > div > div#2 | democracy

module.exports = manifest
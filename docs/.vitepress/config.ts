import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Autoswag',
    description: 'Generate OpenAPI documentation from TypeScript types and JSDoc comments',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [{ text: 'Guide', link: '/guide/installation' }],

        sidebar: {
            '/guide/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/guide/introduction' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Quick Start', link: '/guide/quick-start' },
                        { text: 'Configuration', link: '/guide/configuration' },
                    ],
                },
                {
                    text: 'Defining Endpoints',
                    items: [
                        { text: 'Overview', link: '/guide/tags-overview' },
                        {
                            text: 'Operation Object',
                            link: '/guide/operation-object',
                        },
                        { text: 'Parameter Object', link: '/guide/parameter-object' },
                        { text: 'Request Body Object', link: '/guide/request-body-object' },
                        { text: 'Response Object', link: '/guide/response-object' },
                        { text: 'Type referencing', link: '/guide/type-referencing' },
                        { text: 'Security', link: '/guide/security' },
                    ],
                },
                {
                    text: 'TypeScript Support',
                    items: [
                        { text: 'Supported Types', link: '/guide/supported-types' },
                        { text: 'Components', link: '/guide/components' },
                        { text: 'Metadata Tags', link: '/guide/metadata-tags' },
                        { text: 'JSDoc @typedef', link: '/guide/jsdoc-typedef' },
                    ],
                },
                {
                    text: 'Examples',
                    items: [
                        { text: 'REST API', link: '/guide/rest-api-example' },
                        { text: 'With Zod', link: '/guide/zod-example' },
                    ],
                },
            ],
        },

        socialLinks: [{ icon: 'github', link: 'https://github.com/seyves/swagger-autodoc' }],

        search: {
            provider: 'local',
        },

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-present',
        },
    },
    markdown: {
        config(md) {
            md.use(groupIconMdPlugin)
        },
    },
    vite: {
        plugins: [groupIconVitePlugin()],
    },
})

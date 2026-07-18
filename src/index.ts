import { generate, OpenApiVersion } from 'swagger-autodoc'

const baseDoc = {
    info: {
        title: 'My API specification',
        version: '1.0.0',
    },
}

const openApiDocument = generate({
    source: ['src/examples/*.ts'],
    baseDoc,
    version: OpenApiVersion.v31,
})

console.log(JSON.stringify(openApiDocument, null, 2))
// fs.writeFileSync('./openapi.json', JSON.stringify(openApiDocument, null, 4))

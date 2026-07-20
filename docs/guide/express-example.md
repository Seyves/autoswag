# Express.js Integration

Use Swagger Autodoc with Express.js applications.

## Example

```ts
import express from 'express'

/**
 * @autodoc GET /users
 * @response {User[]} 200 Users
 */
app.get('/users', async (req, res) => {
    const users = await db.users.findMany()
    res.json(users)
})

/**
 * @autodoc POST /users
 * @accept {CreateUserRequest}
 * @response {User} 201 Created
 */
app.post('/users', async (req, res) => {
    const user = await db.users.create(req.body)
    res.status(201).json(user)
})
```

Works with any Express app structure. Document handlers with JSDoc, generate OpenAPI.

**[See full REST API example →](./rest-api-example)**
